FROM node:22-alpine AS build
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM busybox:1.36
EXPOSE 8080
COPY --from=build /app/dist /www
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
CMD ["httpd", "-f", "-p", "8080", "-h", "/www"]
