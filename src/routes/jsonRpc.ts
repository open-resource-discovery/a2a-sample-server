import { Router } from "express";
import { handleMessageSend } from "../handlers/messageSend.js";
import { JSON_RPC_ERRORS, type JsonRpcRequest, type JsonRpcResponse } from "../types/jsonRpc.js";

export const jsonRpcRouter = Router();

jsonRpcRouter.post("/", async (req, res) => {
  const request = req.body as JsonRpcRequest;

  // Validate JSON-RPC request
  if (request.jsonrpc !== "2.0" || !request.method) {
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: request.id ?? null,
      error: {
        code: JSON_RPC_ERRORS.INVALID_REQUEST,
        message: "Invalid JSON-RPC request",
      },
    };
    return res.json(response);
  }

  try {
    let result: Record<string, unknown>;

    switch (request.method) {
      case "SendMessage":
      case "message/send":
        result = await handleMessageSend(request.params);
        break;

      default: {
        const response: JsonRpcResponse = {
          jsonrpc: "2.0",
          id: request.id,
          error: {
            code: JSON_RPC_ERRORS.METHOD_NOT_FOUND,
            message: `Method not found: ${request.method}`,
          },
        };
        return res.json(response);
      }
    }

    const response: JsonRpcResponse<Record<string, unknown>> = {
      jsonrpc: "2.0",
      id: request.id,
      result,
    };
    res.json(response);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error handling JSON-RPC request:", error);
    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: request.id,
      error: {
        code: JSON_RPC_ERRORS.INTERNAL_ERROR,
        message: error instanceof Error ? error.message : "Internal error",
      },
    };
    res.json(response);
  }
});
