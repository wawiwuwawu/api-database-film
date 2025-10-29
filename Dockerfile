# Gunakan base image Node.js LTS (versi 20-alpine)
FROM node:20-alpine

# Tetapkan direktori kerja di dalam container
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install SEMUA dependensi (termasuk devDependencies seperti nodemon)
RUN npm install

# Salin sisa kode aplikasi
# Catatan: Kode ini akan "ditimpa" sementara oleh bind mount saat development
COPY . .

# Buat folder uploads jika diperlukan oleh aplikasi Anda
RUN mkdir -p uploads && chmod 755 uploads

# Buat user non-root untuk keamanan
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Berikan kepemilikan folder /app ke user baru
RUN chown -R nodejs:nodejs /app
# Ganti ke user non-root
USER nodejs

# Expose port (ganti ini jika app.js Anda pakai port lain)
EXPOSE 5000

# Perintah default. Ini akan kita override di docker-compose.
CMD ["node", "app.js"]