package main

import (
	"net/http"

	"github.com/cloudwego/hertz/pkg/app"
)

type Code uint8

const (
	CodeOk Code = iota + 1
	CodeFail
)

type Response[T any] struct {
	Code Code   `json:"code,omitempty"`
	Msg  string `json:"msg,omitempty"`
	Data T      `json:"data,omitempty"`
}

type RespOption[T any] func(resp *Response[T])

func RespWithMsg[T any](msg string) RespOption[T] {
	return func(resp *Response[T]) {
		resp.Msg = msg
	}
}

func RespWithData[T any](data T) RespOption[T] {
	return func(resp *Response[T]) {
		resp.Data = data
	}
}

func RespOk[T any](ctx *app.RequestContext, opts ...RespOption[T]) {
	SendResp[T](ctx, CodeOk, opts...)
}

func RespFail[T any](ctx *app.RequestContext, opts ...RespOption[T]) {
	SendResp[T](ctx, CodeFail, opts...)
}

func SendResp[T any](ctx *app.RequestContext, code Code, opts ...RespOption[T]) {
	resp := &Response[T]{
		Code: code,
	}

	for _, opt := range opts {
		opt(resp)
	}

	ctx.JSON(http.StatusOK, resp)
}
