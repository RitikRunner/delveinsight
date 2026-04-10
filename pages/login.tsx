import type { GetServerSideProps } from "next";
import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

import ThemeToggle from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isAuthenticated } from "@/lib/auth";

type LoginPageProps = {
  showError: boolean;
};

export default function LoginPage({ showError }: LoginPageProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_35%),linear-gradient(135deg,_rgba(255,255,255,1),_rgba(248,250,252,1))] px-4 py-8 dark:bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.15),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,1),_rgba(15,23,42,1))]">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex justify-end lg:col-span-2">
          <ThemeToggle />
        </div>
        <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-slate-950 p-8 text-slate-50 shadow-2xl lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.28),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.22),_transparent_30%)]" />
          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium text-white/90 backdrop-blur">
                <ShieldCheck className="h-4 w-4" />
                Secure login
              </div>
              <div className="max-w-xl space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-sky-200/80">
                  Welcome back
                </p>
                <h1 className="text-4xl font-semibold tracking-tight text-balance lg:text-5xl">
                  Sign in to open your notes.
                </h1>
                <p className="text-base leading-7 text-slate-300">
                  Use your email and password to view and save your notes safely.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-sky-200">Sign in</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Enter your details to continue.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-sky-200">Private</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Your notes are only shown after login.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                <p className="text-sm font-medium text-sky-200">Try it</p>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  Use the demo login shown here.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center">
          <Card className="w-full max-w-md border-border/70 bg-card/95 py-0 shadow-xl backdrop-blur">
            <CardHeader className="space-y-3 px-8 pt-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
                <LockKeyhole className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription className="text-sm leading-6">
                  Email:{" "}
                  <span className="font-medium">demo@browsernotes.app</span>
                  <br />
                  Password: <span className="font-medium">Notes@123</span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-5 px-8 pb-8">
              <form action="/auth/login" method="post" className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      className="h-11 pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11"
                    required
                  />
                </div>

                {showError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    Invalid email or password. Please try the demo credentials
                    again.
                  </div>
                ) : null}

                <Button type="submit" className="h-11 w-full text-sm font-semibold">
                  Sign In
                </Button>
              </form>

              <p className="text-center text-sm leading-6 text-muted-foreground">
                After login, you will go to{" "}
                <Link
                  href="/notes"
                  className="font-medium text-foreground underline-offset-4 hover:underline"
                >
                  /notes
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<LoginPageProps> = async ({
  query,
  req,
}) => {
  if (isAuthenticated(req.headers.cookie)) {
    return {
      redirect: {
        destination: "/notes",
        permanent: false,
      },
    };
  }

  return {
    props: {
      showError: query.error === "invalid_credentials",
    },
  };
};
