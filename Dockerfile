# 构建 Node.js 应用,即前端静态资源
FROM node:20-alpine as builder-node  

#将项目文件和依赖安装在 /app 目录下
WORKDIR /app

#将项目的 package.json 和 package-lock.json 文件复制到 Docker 镜像的 /app 目录
COPY package.json package-lock.json ./ 

#安装依赖
RUN npm install

#将项目文件复制到 Docker 镜像的 /app 目录，/app 是 Docker 容器内部的目录，而不是宿主机文件系统
COPY . .

#生成静态文件，供后续的后端服务使用
RUN npm run build

# 构建 Go 应用，即后端服务
FROM golang:1.21-alpine AS builder

WORKDIR /app

#将 go.mod 和 go.sum 文件复制到 Docker 容器的 /app 目录
COPY go.mod go.sum ./ 

RUN go mod download

COPY . .

#将 builder-node 阶段（即 Node.js 阶段）中生成的 dist 目录复制到 /app/static/dist 目录中
COPY --from=builder-node /app/static/dist /app/static/dist

#运行 go build 命令，使用 release 标签编译 Go 源代码，并输出为名为 woom 的二进制文件
RUN go build -tags release -o woom

# 创建最终的可执行文件镜像
FROM alpine AS bin

#将 woom 二进制文件复制到 /usr/bin/woom 目录中
COPY --from=builder /app/woom /usr/bin/woom

#声明容器会监听 4000 端口
EXPOSE 4000/tcp

#设置容器启动时直接执行该文件，使 Go 应用在启动时立即运行
ENTRYPOINT ["/usr/bin/woom"]