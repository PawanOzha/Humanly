"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useAnimationControls, useReducedMotion, MotionConfig } from "motion/react";
import { HowPanel } from "@/components/auth/how-panel";
import { Avatar } from "@/components/auth/avatar";
import { googleStartURL } from "@/lib/api";
import { useSession, useSignOut } from "@/lib/session";
import { useAuth } from "@/lib/stores/auth";
import { AMBER, BRAND, EASE, GREEN, INK, MUTED, RED } from "@/lib/tokens";

type Mode = "login" | "signup";
type Status = "idle" | "loading" | "success";

const EMAIL = /^\S+@\S+\.\S+$/;

function strength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return password.length < 8 ? Math.min(score, 1) : score;
}

const STRENGTH_LABEL = ["Too short", "Weak", "Okay", "Strong", "Very strong"];
const STRENGTH_COLOR = ["#e6e6e2", RED, AMBER, GREEN, GREEN];

function Logo() {
  return (
    <Link href="/" className="au-logo">
      <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden>
        <circle cx="15" cy="15" r="15" fill="#d4f26a" />
        <g stroke={INK} strokeWidth="2.6" strokeLinecap="round">
          <path d="M15 7.5v15" />
          <path d="M8.5 11.2l13 7.6" />
          <path d="M21.5 11.2l-13 7.6" />
        </g>
      </svg>
      {BRAND}
    </Link>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z" />
    </svg>
  );
}

function Spinner() {
  return (
    <motion.span
      className="au-spinner"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
    />
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <motion.path d="M3 8.5l3.2 3L13 4.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4, ease: EASE }} />
    </svg>
  );
}

function Eye({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1.5 10S5 4 10 4s8.5 6 8.5 6-3.5 6-8.5 6-8.5-6-8.5-6z" />
      <circle cx="10" cy="10" r="2.4" />
      {off && <path d="M3 3l14 14" />}
    </svg>
  );
}

function Field({
  id, label, type = "text", value, onChange, error, trailing, autoComplete, disabled,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  trailing?: ReactNode;
  autoComplete?: string;
  disabled?: boolean;
}) {
  const [focus, setFocus] = useState(false);
  const lifted = focus || value.length > 0;
  return (
    <div>
      <div className="au-field" data-focus={focus} data-error={!!error}>
        <motion.label
          htmlFor={id}
          animate={{ y: lifted ? -11 : 0, scale: lifted ? 0.78 : 1 }}
          transition={{ duration: 0.25, ease: EASE }}
          style={{ color: error ? RED : MUTED }}
        >
          {label}
        </motion.label>
        <input
          id={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
        />
        {trailing}
      </div>
      <AnimatePresence initial={false}>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{ overflow: "hidden" }}
          >
            <div className="au-field-error" role="alert">{error}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AuthScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const reduce = !!useReducedMotion();
  const mode: Mode = pathname.startsWith("/signup") ? "signup" : "login";
  const session = useSession();
  const signOut = useSignOut();
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [via, setVia] = useState<"google" | "email" | null>(null);
  const [googleError, setGoogleError] = useState("");
  const shake = useAnimationControls();
  const score = strength(password);
  const signup = mode === "signup";
  const dest = useRef("/dashboard");

  useEffect(() => {
    document.title = signup ? "Create account — Humanora" : "Log in — Humanora";
  }, [signup]);

  // Switching between log in and sign up starts the form fresh.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    setPassword("");
    setErrors({});
    setShow(false);
    setGoogleError("");
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [mode]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      // The callback hands the failure over in the URL, which only exists in the browser.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoogleError(error);
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      const next = url.searchParams.toString();
      window.history.replaceState(null, "", url.pathname + (next ? `?${next}` : ""));
    }
    const next = params.get("next");
    if (next && next.startsWith("/") && !next.startsWith("//") && !/[\\\r\n]/.test(next)) dest.current = next;
  }, []);

  useEffect(() => {
    if (status !== "success") return;
    const timer = window.setTimeout(() => router.push(dest.current), reduce ? 0 : 160);
    return () => window.clearTimeout(timer);
  }, [status, reduce, router]);

  const switchMode = (next: Mode) => {
    if (next === mode || status !== "idle") return;
    router.push(next === "signup" ? "/signup" : "/login", { scroll: false });
  };

  const onGoogle = () => {
    if (status !== "idle") return;
    setGoogleError("");
    setVia("google");
    setStatus("loading");
    window.location.assign(googleStartURL(dest.current));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (status !== "idle") return;
    const next: Record<string, string> = {};
    if (signup && name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL.test(email.trim())) next.email = "Enter a valid email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length) {
      shake.start({ x: [0, -8, 8, -5, 5, 0], transition: { duration: 0.4 } });
      return;
    }
    setVia("email");
    setStatus("loading");
    const run = signup
      ? useAuth.getState().signup(name.trim(), email.trim(), password)
      : useAuth.getState().login(email.trim(), password);
    void run.then(() => {
      setStatus("success");
    }).catch((err: unknown) => {
      setStatus("idle");
      setVia(null);
      const message = err instanceof Error ? err.message : "Couldn't sign in.";
      setErrors({ form: message === "Failed to fetch" ? "Humanora is offline." : message });
    });
  };

  const welcome = status === "idle" && session;
  const formError = errors.form || googleError;

  return (
    <MotionConfig reducedMotion="user">
      <main className="au-root">
        <section className="au-left">
          <div className="au-top">
            {status !== "success" && !welcome && <Logo />}
            <Link href="/" className="au-back">Back to home</Link>
          </div>

          <div className="au-center">
            <motion.div className="au-sheet" animate={shake}>
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div key="done" className="au-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                    <span className="au-done-check"><Check /></span>
                    <h1>{signup ? "Account created" : "Welcome back"}</h1>
                    <p>Opening your dashboard.</p>
                  </motion.div>
                ) : welcome ? (
                  <motion.div key="welcome" className="au-done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE }}>
                    <Avatar session={session} size={56} />
                    <h1>You&apos;re signed in.</h1>
                    <p>{session.email}</p>
                    <button type="button" className="au-submit" onClick={() => router.push("/dashboard")}>Continue</button>
                    <button
                      type="button"
                      className="au-text"
                      onClick={() => {
                        void signOut();
                        setEmail("");
                        setPassword("");
                        setName("");
                        setErrors({});
                      }}
                    >
                      Use a different account
                    </button>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: EASE }}>
                    <div className="au-intro">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={mode} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease: EASE }}>
                          <h1>
                            {signup ? <>Start writing <span className="hm-serif">human.</span></> : <>Welcome <span className="hm-serif">back.</span></>}
                          </h1>
                          <p>{signup ? "Free to start. No card needed." : "Log in to pick up where you left off."}</p>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className="au-seg">
                      {(["login", "signup"] as const).map((item) => (
                        <button key={item} type="button" onClick={() => switchMode(item)} style={{ color: mode === item ? INK : MUTED }}>
                          {mode === item && <motion.span layoutId="au-seg" transition={{ type: "tween", duration: 0.22, ease: EASE }} className="au-seg-pill" />}
                          <span>{item === "login" ? "Log in" : "Sign up"}</span>
                        </button>
                      ))}
                    </div>

                    <button type="button" className="au-google" onClick={onGoogle} disabled={status !== "idle"}>
                      {status === "loading" && via === "google" ? <Spinner /> : <GoogleMark />}
                      Continue with Google
                    </button>

                    <div className="au-or"><span>or with email</span></div>

                    <form onSubmit={submit} noValidate>
                      <AnimatePresence initial={false}>
                        {signup && (
                          <motion.div key="name" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} style={{ overflow: "hidden" }}>
                            <div className="au-gap">
                              <Field id={nameId} label="Full name" value={name} onChange={setName} error={errors.name} autoComplete="name" disabled={status !== "idle"} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <div className="au-gap">
                        <Field id={emailId} label="Email address" type="email" value={email} onChange={setEmail} error={errors.email} autoComplete="email" disabled={status !== "idle"} />
                      </div>
                      <Field
                        id={passwordId}
                        label="Password"
                        type={show ? "text" : "password"}
                        value={password}
                        onChange={setPassword}
                        error={errors.password}
                        autoComplete={signup ? "new-password" : "current-password"}
                        disabled={status !== "idle"}
                        trailing={
                          <button type="button" className="au-eye" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow((value) => !value)}>
                            <Eye off={show} />
                          </button>
                        }
                      />

                      <AnimatePresence initial={false}>
                        {signup && password.length > 0 && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} style={{ overflow: "hidden" }}>
                            <div className="au-strength">
                              <div>
                                {[0, 1, 2, 3].map((i) => (
                                  <motion.span key={i} animate={{ backgroundColor: i < score ? STRENGTH_COLOR[score] : "#eeeeea" }} transition={{ duration: 0.3 }} />
                                ))}
                              </div>
                              <span className="hm-mono" style={{ color: score > 1 ? INK : MUTED }}>{STRENGTH_LABEL[score]}</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence initial={false}>
                        {formError && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                            <div className="au-form-error" role="alert">{formError}</div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        className="au-submit"
                        disabled={status !== "idle"}
                        whileHover={status === "idle" ? { y: -1 } : undefined}
                        whileTap={status === "idle" ? { scale: 0.985 } : undefined}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span key={status} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                            {status === "loading" && via === "email" ? <><Spinner /> {signup ? "Creating account…" : "Logging in…"}</> : signup ? "Create account" : "Log in"}
                          </motion.span>
                        </AnimatePresence>
                      </motion.button>
                    </form>

                    <p className="au-switch">
                      {signup ? "Already have an account? " : "New here? "}
                      <button type="button" onClick={() => switchMode(signup ? "login" : "signup")}>{signup ? "Log in" : "Create an account"}</button>
                    </p>
                    {signup && <p className="au-legal">By continuing you agree to Humanora&apos;s terms.</p>}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          <div className="au-foot hm-mono">© {new Date().getFullYear()} {BRAND}</div>
        </section>
        <HowPanel />
      </main>
    </MotionConfig>
  );
}
