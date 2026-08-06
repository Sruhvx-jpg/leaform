"use client";

import { trpc } from "~/trpc/client";

export function useSignup() {
  const mutation = trpc.auth.signUpUser.useMutation();

  return {
    signup: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset,
  };
}
