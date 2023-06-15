# Menggunakan gambar Node.js sebagai dasar
FROM node:16

# Mengatur direktori kerja dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json ke dalam container
COPY package*.json ./

# Menginstal dependensi
RUN npm install

# Menyalin kode aplikasi ke dalam container
COPY . .

# Menjalankan perintah untuk mengenerate file Swagger JSON
RUN npm run swagger:generate

# Menentukan port yang akan digunakan oleh aplikasi
ENV PORT=3000
EXPOSE $PORT

# Menjalankan perintah untuk memulai aplikasi ketika container dimulai
CMD ["npm", "start"]