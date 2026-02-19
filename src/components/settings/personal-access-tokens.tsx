'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, KeyRound, Loader2, ShieldAlert, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createPersonalAccessToken,
  getPersonalAccessTokens,
  revokePersonalAccessToken,
} from '@/lib/api';
import type { PersonalAccessToken } from '@/lib/types';

const DATE_FORMAT = {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
} as const;

function formatDate(value: string | null) {
  if (!value) {
    return 'Never';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  return date.toLocaleDateString(undefined, DATE_FORMAT);
}

export function PersonalAccessTokens() {
  const queryClient = useQueryClient();
  const [newToken, setNewToken] = useState({
    name: '',
    scopes: '',
    expiresAt: '',
  });
  const [createdToken, setCreatedToken] = useState<string | null>(null);

  const { data: tokens = [], isLoading } = useQuery({
    queryKey: ['personalAccessTokens'],
    queryFn: getPersonalAccessTokens,
  });

  const parsedScopes = useMemo(() => {
    return newToken.scopes
      .split(',')
      .map((scope) => scope.trim())
      .filter(Boolean);
  }, [newToken.scopes]);

  const createMutation = useMutation({
    mutationFn: createPersonalAccessToken,
    onSuccess: ({ pat, token }) => {
      queryClient.setQueryData<PersonalAccessToken[]>(
        ['personalAccessTokens'],
        (old = []) => [pat, ...old],
      );
      setNewToken({ name: '', scopes: '', expiresAt: '' });
      if (token) {
        setCreatedToken(token);
      }
      toast.success('Personal access token created.');
    },
    onError: () => {
      toast.error('Failed to create personal access token.');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokePersonalAccessToken,
    onSuccess: (_, tokenId) => {
      queryClient.setQueryData<PersonalAccessToken[]>(
        ['personalAccessTokens'],
        (old = []) => old.filter((item) => item.id !== tokenId),
      );
      toast.success('Personal access token revoked.');
    },
    onError: () => {
      toast.error('Failed to revoke personal access token.');
    },
  });

  const handleCreate = async () => {
    if (!newToken.name.trim()) {
      return;
    }

    const expiresAt = newToken.expiresAt
      ? new Date(newToken.expiresAt).toISOString()
      : null;

    try {
      await createMutation.mutateAsync({
        name: newToken.name.trim(),
        scopes: parsedScopes.length > 0 ? parsedScopes : undefined,
        expires_at: expiresAt,
      });
    } catch (error) {
      console.error('Failed to create personal access token:', error);
    }
  };

  const handleCopy = async () => {
    if (!createdToken) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdToken);
      toast.success('Token copied to clipboard.');
    } catch (error) {
      toast.error('Unable to copy token.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Create a new token</CardTitle>
          <CardDescription>
            Generate a personal access token for API access. You will only see
            the token once.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="pat-name">Token name</Label>
            <Input
              id="pat-name"
              placeholder="CLI automation"
              value={newToken.name}
              onChange={(event) =>
                setNewToken((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pat-scopes">Scopes (optional)</Label>
            <Input
              id="pat-scopes"
              placeholder="bookmarks.read, notes.write"
              value={newToken.scopes}
              onChange={(event) =>
                setNewToken((prev) => ({
                  ...prev,
                  scopes: event.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Separate scopes with commas. Leave blank for all scopes.
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="pat-expires">Expiration date (optional)</Label>
            <Input
              id="pat-expires"
              type="date"
              value={newToken.expiresAt}
              onChange={(event) =>
                setNewToken((prev) => ({
                  ...prev,
                  expiresAt: event.target.value,
                }))
              }
            />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button
            onClick={handleCreate}
            disabled={!newToken.name.trim() || createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create token'
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl">Active tokens</CardTitle>
            <CardDescription>
              Manage existing tokens and revoke access anytime.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <KeyRound className="h-4 w-4" />
            {tokens.length} tokens
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : tokens.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <ShieldAlert className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No personal access tokens yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="rounded-lg border border-border p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {token.name}
                      </h3>
                      {token.expires_at && (
                        <Badge variant="outline">Expires</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {token.scopes && token.scopes.length > 0 ? (
                        token.scopes.map((scope) => (
                          <Badge key={scope} variant="secondary">
                            {scope}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary">All scopes</Badge>
                      )}
                    </div>
                    <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>Created: {formatDate(token.created_at)}</span>
                      <span>Last used: {formatDate(token.last_used_at)}</span>
                      <span>Expires: {formatDate(token.expires_at)}</span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="self-start md:self-center"
                        disabled={revokeMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Revoke
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke token</AlertDialogTitle>
                        <AlertDialogDescription>
                          This token will immediately stop working. You cannot
                          undo this action.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => revokeMutation.mutate(token.id)}
                        >
                          Revoke token
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={Boolean(createdToken)}
        onOpenChange={(open) => {
          if (!open) {
            setCreatedToken(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your new token</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Copy this token now. You will not be able to view it again.
            </p>
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm break-all">
              {createdToken}
            </div>
            <Button onClick={handleCopy} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy token
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
