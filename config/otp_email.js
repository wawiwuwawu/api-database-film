const nodemailer = require('nodemailer');

const GMAIL_USER = process.env.EMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.EMAIL_PASS;

if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    console.error("FATAL ERROR: Kredensial email (EMAIL_USER atau EMAIL_PASS) tidak ditemukan di environment variables.");
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
    },
});


async function sendOTPEmail(email, otp) {
    console.log(`Mencoba mengirim OTP ke: ${email}`);

    const mailOptions = {
        from: `"Weebase" <${GMAIL_USER}>`,
        to: email,
        subject: 'Kode Verifikasi Anda',
        html: `
            <div style="font-family: sans-serif; text-align: center; color: #333;">
                <h2>Kode Verifikasi Anda</h2>
                <p>Gunakan kode di bawah ini untuk melanjutkan proses registrasi. Terimakasih sudah mendaftar pada aplikasi kami. Jangan lupa kunjungi Wawunime </p>
                <h1 style="letter-spacing: 5px; background-color: #f0f0f0; padding: 20px; border-radius: 8px;">${otp}</h1>
                <p>Kode ini hanya berlaku selama 5 menit.</p>
                <hr>
                <p style="font-size: 12px; color: #888;">Jika Anda tidak merasa meminta kode ini, mohon abaikan email ini.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email OTP berhasil dikirim: ${info.response}`);
    } catch (error) {
        console.error(`Error saat mengirim email ke ${email}:`, error);
        throw new Error('Gagal mengirim email verifikasi.');
    }
}

module.exports = { sendOTPEmail };