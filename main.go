// main 包含程序的入口点
package main

import (
	"fmt"
	"net/http"
)

// main 函数是程序的入口，启动 HTTP 服务器
func main() {
	// 处理根路径的 HTTP 请求
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintln(w, "Hello, WOOM!")
	})
	// 输出服务器启动信息
	fmt.Println("Server started at :8080")
	// 启动 HTTP 服务器
	http.ListenAndServe(":8080", nil)
}
