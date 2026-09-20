import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: 'Method Not Allowed',
      }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');

    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const nama = String(body.nama || '').trim();

    if (!email || !password || !nama) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Nama, email, dan password wajib diisi.',
        }),
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Password minimal 6 karakter.',
        }),
      };
    }

    const supabaseUrl =
      process.env.SUPABASE_URL ||
      process.env.VITE_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'SUPABASE_URL belum dikonfigurasi.',
        }),
      };
    }

    if (!serviceRoleKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'SUPABASE_SERVICE_ROLE_KEY belum dikonfigurasi.',
        }),
      };
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    /*
     * email_confirm: true
     *
     * Artinya Super Admin langsung dianggap
     * sudah memverifikasi email.
     */
    const {
      data: authData,
      error: authError,
    } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nama,
        role: 'Super Admin',
      },
    });

    if (authError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: authError.message,
        }),
      };
    }

    if (!authData.user) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'User Super Admin gagal dibuat.',
        }),
      };
    }

    /*
     * Simpan profil Super Admin ke hris_users.
     */
    const { error: profileError } =
      await supabaseAdmin
        .from('hris_users')
        .upsert(
          {
            id: authData.user.id,
            email,
            nama,
            role: 'Super Admin',
            status: 'Aktif',
          },
          {
            onConflict: 'id',
          }
        );

    if (profileError) {
      /*
       * Jika profil gagal dibuat, hapus user Auth
       * supaya tidak meninggalkan akun setengah jadi.
       */
      await supabaseAdmin.auth.admin.deleteUser(
        authData.user.id
      );

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: profileError.message,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message:
          'Super Admin berhasil dibuat dan email sudah otomatis terverifikasi.',
        user_id: authData.user.id,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'Terjadi kesalahan server.',
      }),
    };
  }
};

export { handler };
