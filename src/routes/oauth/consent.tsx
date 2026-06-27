import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth/context";
import { supabase } from "@/lib/clients/supabase/client";
import type { OAuthAuthorizationDetails } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, LoaderCircle, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod";

const consentSearchSchema = z.object({
  authorization_id: z.string().min(1).optional(),
});

const scopeLabels: Record<string, string> = {
  openid: "Basic identity",
  email: "Email address",
  profile: "Profile information",
};

export const Route = createFileRoute("/oauth/consent")({
  component: OAuthConsent,
  validateSearch: consentSearchSchema,
});

function OAuthConsent() {
  const { authorization_id: authorizationId } = Route.useSearch();
  const { loading: authLoading, user } = useAuth();
  const [authorization, setAuthorization] = useState<OAuthAuthorizationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [decision, setDecision] = useState<"approve" | "deny" | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!authorizationId) {
      setError("This authorization request is missing its identifier.");
      return;
    }

    if (!user) {
      const returnTo = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
      window.location.replace(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
      return;
    }

    let cancelled = false;

    const loadAuthorization = async () => {
      const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
      if (claimsError || !claimsData?.claims) {
        const returnTo = `/oauth/consent?authorization_id=${encodeURIComponent(authorizationId)}`;
        window.location.replace(`/auth/login?redirect=${encodeURIComponent(returnTo)}`);
        return;
      }

      const { data, error: authorizationError } =
        await supabase.auth.oauth.getAuthorizationDetails(authorizationId);

      if (cancelled) return;

      if (authorizationError || !data) {
        setError(authorizationError?.message ?? "Could not load this authorization request.");
        return;
      }

      if (!("authorization_id" in data)) {
        window.location.assign(data.redirect_url);
        return;
      }

      setAuthorization(data);
    };

    void loadAuthorization();

    return () => {
      cancelled = true;
    };
  }, [authLoading, authorizationId, user]);

  const submitDecision = async (action: "approve" | "deny") => {
    if (!authorizationId || decision) return;

    setDecision(action);
    setError(null);

    const result =
      action === "approve"
        ? await supabase.auth.oauth.approveAuthorization(authorizationId, {
            skipBrowserRedirect: true,
          })
        : await supabase.auth.oauth.denyAuthorization(authorizationId, {
            skipBrowserRedirect: true,
          });

    if (result.error || !result.data?.redirect_url) {
      setError(result.error?.message ?? "Could not complete this authorization request.");
      setDecision(null);
      return;
    }

    window.location.assign(result.data.redirect_url);
  };

  const scopes = authorization?.scope.split(/\s+/).filter(Boolean) ?? [];

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo size="lg" href="/" showText={false} />
        </div>

        <Card>
          <CardHeader className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck aria-hidden="true" className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl">
              {authorization ? `Authorize ${authorization.client.name}` : "Authorize access"}
            </CardTitle>
            <CardDescription>
              {authorization
                ? `${authorization.client.name} is requesting access to your Turbodoc account.`
                : "Reviewing the authorization request…"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-destructive/30 bg-destructive/10 p-4"
              >
                <p className="font-medium text-destructive">Authorization failed</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            ) : null}

            {!authorization && !error ? (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <LoaderCircle aria-hidden="true" className="h-5 w-5 animate-spin" />
                Loading request details…
              </div>
            ) : null}

            {authorization ? (
              <>
                <section aria-labelledby="permissions-heading">
                  <h2 id="permissions-heading" className="text-sm font-medium">
                    Requested permissions
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {scopes.map((scope) => (
                      <li
                        key={scope}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {scopeLabels[scope] ?? scope}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-lg border bg-muted/40 p-4 text-sm">
                  <p className="font-medium">Redirect destination</p>
                  <p className="mt-1 flex items-start gap-2 break-all text-muted-foreground">
                    <ExternalLink aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                    {authorization.redirect_uri}
                  </p>
                </section>

                <p className="text-xs leading-relaxed text-muted-foreground">
                  Turbodoc will only share the permissions shown above. You can revoke this access
                  later from your account.
                </p>
              </>
            ) : null}
          </CardContent>

          {authorization ? (
            <CardFooter className="justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={decision !== null}
                onClick={() => void submitDecision("deny")}
              >
                {decision === "deny" ? "Cancelling…" : "Cancel"}
              </Button>
              <Button
                type="button"
                disabled={decision !== null}
                onClick={() => void submitDecision("approve")}
              >
                {decision === "approve" ? "Authorizing…" : "Authorize"}
              </Button>
            </CardFooter>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
