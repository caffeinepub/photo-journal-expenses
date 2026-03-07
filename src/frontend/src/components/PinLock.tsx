import { BookImage, Delete } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

const CORRECT_PIN = "1990";

interface PinLockProps {
  onUnlock: () => void;
}

export function PinLock({ onUnlock }: PinLockProps) {
  const [pin, setPin] = useState("");
  const [shaking, setShaking] = useState(false);
  const [errorFlash, setErrorFlash] = useState(false);

  const handleDigit = useCallback(
    (digit: string) => {
      if (shaking) return;
      if (pin.length >= 4) return;
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        if (next === CORRECT_PIN) {
          // Small delay to show the 4th dot filling before unlocking
          setTimeout(onUnlock, 300);
        } else {
          // Wrong PIN — shake and reset
          setShaking(true);
          setErrorFlash(true);
          setTimeout(() => {
            setPin("");
            setShaking(false);
            setErrorFlash(false);
          }, 700);
        }
      }
    },
    [pin, shaking, onUnlock],
  );

  const handleBackspace = useCallback(() => {
    if (shaking) return;
    setPin((prev) => prev.slice(0, -1));
  }, [shaking]);

  // Keyboard support
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key >= "0" && e.key <= "9") {
        handleDigit(e.key);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        handleBackspace();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleDigit, handleBackspace]);

  const dotVariants = {
    idle: { scale: 1 },
    filled: { scale: [1, 1.3, 1], transition: { duration: 0.2 } },
  };

  const shakeVariants = {
    idle: { x: 0 },
    shake: {
      x: [0, -10, 10, -8, 8, -5, 5, 0],
      transition: { duration: 0.5, ease: [0.36, 0.07, 0.19, 0.97] as const },
    },
  };

  // Pad layout: [1..9], then [backspace, 0, empty]
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 60%, oklch(0.22 0.06 75 / 0.35), transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-10 px-8"
      >
        {/* Logo + Title */}
        <div className="flex flex-col items-center gap-3">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, ease: "backOut" }}
            className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center shadow-photo"
          >
            <BookImage className="w-7 h-7 text-primary" strokeWidth={1.5} />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="font-display text-2xl font-semibold tracking-tight text-foreground"
          >
            Photo Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="font-body text-sm text-muted-foreground"
          >
            Enter your PIN to continue
          </motion.p>
        </div>

        {/* PIN Dots */}
        <motion.div
          variants={shakeVariants}
          animate={shaking ? "shake" : "idle"}
          className="flex items-center gap-4"
        >
          {Array.from({ length: 4 }, (_, i) => {
            const filled = i < pin.length;
            const isCurrent = i === pin.length - 1;
            const dotKey = `dot-${i}`;
            return (
              <motion.div
                key={dotKey}
                variants={dotVariants}
                animate={isCurrent && filled ? "filled" : "idle"}
                className="relative flex items-center justify-center"
              >
                <div
                  className={[
                    "w-4 h-4 rounded-full transition-all duration-200",
                    filled
                      ? errorFlash
                        ? "bg-destructive shadow-[0_0_12px_oklch(0.58_0.20_22/0.6)]"
                        : "bg-primary shadow-[0_0_12px_oklch(0.78_0.12_75/0.5)]"
                      : "border-2 border-border bg-transparent",
                  ].join(" ")}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Keypad */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="grid grid-cols-3 gap-3"
        >
          {/* Digits 1–9 */}
          {digits.map((d) => (
            <PadButton key={d} label={d} onClick={() => handleDigit(d)} />
          ))}

          {/* Bottom row: backspace, 0, empty */}
          <PadButton
            key="backspace"
            icon={<Delete className="w-5 h-5" />}
            onClick={handleBackspace}
            aria-label="Backspace"
            variant="ghost"
          />
          <PadButton key="0" label="0" onClick={() => handleDigit("0")} />
          {/* Empty cell for layout balance */}
          <div />
        </motion.div>
      </motion.div>
    </div>
  );
}

interface PadButtonProps {
  label?: string;
  icon?: React.ReactNode;
  onClick: () => void;
  "aria-label"?: string;
  variant?: "default" | "ghost";
}

function PadButton({
  label,
  icon,
  onClick,
  "aria-label": ariaLabel,
  variant = "default",
}: PadButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.06 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      onClick={onClick}
      aria-label={ariaLabel ?? label}
      className={[
        "w-20 h-20 rounded-2xl flex items-center justify-center",
        "font-display text-2xl font-medium select-none",
        "transition-colors duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        variant === "ghost"
          ? "bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          : "bg-card border border-border text-foreground hover:bg-secondary hover:border-primary/30 shadow-xs",
      ].join(" ")}
    >
      {icon ?? label}
    </motion.button>
  );
}
