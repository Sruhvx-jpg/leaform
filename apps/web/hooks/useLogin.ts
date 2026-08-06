"use client";

import { trpc } from "~/trpc/client";

export function useLogin() {
  const mutation = trpc.auth.loginUser.useMutation();

  return {
    login: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}
