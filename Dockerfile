# Giai đoạn 1: Build ứng dụng với pnpm
FROM node:20-alpine AS build

# Cài đặt pnpm
RUN npm install -g pnpm

WORKDIR /app

# Copy file package.json và pnpm-lock.yaml để cài dependencies
COPY package.json pnpm-lock.yaml ./

# Cài đặt dependencies bằng pnpm
RUN pnpm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Thiết lập biến môi trường NODE_ENV là production để dùng trong quá trình build
ENV NODE_ENV=production

# Build ứng dụng cho môi trường production với pnpm
RUN pnpm  build

# Giai đoạn 2: Phục vụ ứng dụng bằng Nginx
FROM nginx:alpine

# Xóa các file mặc định trong thư mục Nginx
RUN rm -rf /usr/share/nginx/html/*

# Sao chép tệp cấu hình Nginx vào thư mục cấu hình Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf



# Copy các file đã build từ giai đoạn 1 (build) vào thư mục Nginx
COPY --from=build /app/dist /usr/share/nginx/html


# Mở cổng 80 (cho HTTP)
EXPOSE 80

# Khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]