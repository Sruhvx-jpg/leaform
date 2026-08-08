"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { trpc } from "~/trpc/client";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  inviteCode: string;
  role: "owner" | "read" | "write";
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
  refetchWorkspaces: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Only enable the query on authenticated pages (not /welcome or /)
  const isAuthenticatedPage = pathname !== "/welcome" && pathname !== "/";

  const { data: workspacesData, isLoading, refetch } = trpc.workspace.getUserWorkspaces.useQuery(
    undefined,
    {
      enabled: isAuthenticatedPage,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000),
      staleTime: 0, // Override global Infinity so it always refetches on mount
      refetchOnMount: "always",
    },
  );

  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);

  useEffect(() => {
    if (workspacesData && workspacesData.length > 0) {
      // Keep active workspace if it still exists, otherwise set to first
      if (activeWorkspace) {
        const found = workspacesData.find((ws) => ws.id === activeWorkspace.id);
        if (found) {
          setActiveWorkspaceState(found);
          return;
        }
      }
      setActiveWorkspaceState(workspacesData[0] as Workspace);
    }
  }, [workspacesData]);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces: (workspacesData || []) as Workspace[],
        activeWorkspace,
        setActiveWorkspace,
        isLoading,
        refetchWorkspaces: refetch,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
