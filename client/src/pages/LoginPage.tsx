import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const LoginPage = () => {
  const [, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const navigate = useNavigate();
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Suppress Google-related CORS console errors
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === "string" &&
        (message.includes("play.google.com/log") ||
          message.includes("Cross-Origin-Resource-Policy") ||
          message.includes("Beacon API cannot load"))
      ) {
        return; // Suppress these specific errors
      }
      originalError.apply(console, args);
    };

    // Initialize terminal with welcome message
    setTerminalOutput([
      "WELCOME TO PROTOCOL OF SUFFERING - v0.0.1",
      "==========================================",
      "",
      "System initialized. Awaiting user authentication.",
      "",
      "Available commands:",
      "  To Authenticate with advanced GOOGLE technology type: LOGIN -g",
      "  For traditional login type: LOGIN <username>",
      "  For supported shell commands type: HELP",
      "  To clear the terminal type: CLEAR",
      "",
    ]);

    // Focus input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Cleanup function to restore original console.error
    return () => {
      console.error = originalError;
    };
  }, []);

  const addToTerminal = (text: string) => {
    setTerminalOutput((prev) => [...prev, text]);
  };

  const handleCommand = (command: string) => {
    const parts = command.trim().split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    addToTerminal(`E:/> ${command}`);

    switch (cmd) {
      case "login":
        if (args.length === 0) {
          addToTerminal("Error: Username required. Usage: login <username>");
          return;
        }
        if (args[0] === "-g") {
          handleGoogleLogin();
          return;
        }
        handleLogin(args[0]);
        break;
      case "help":
        addToTerminal("Available commands:");
        addToTerminal(
          "  To Authenticate with advanced GOOGLE technology type: LOGIN -g"
        );
        addToTerminal("  For traditional login type: LOGIN <username>");
        addToTerminal("  For supported shell commands type: HELP");
        addToTerminal("  To clear the terminal type: CLEAR");
        break;
      case "clear":
        setTerminalOutput([
          "WELCOME TO PROTOCOL OF SUFFERING - v0.0.1",
          "==========================================",
          "",
          "System initialized. Awaiting user authentication.",
          "",
          "Available commands:",
          "  To Authenticate with advanced GOOGLE technology type: LOGIN -g",
          "  For traditional login type: LOGIN <username>",
          "  For supported shell commands type: HELP",
          "  To clear the terminal type: CLEAR",
          "",
        ]);
        break;
      default:
        if (command.trim()) {
          addToTerminal(
            `Unknown command: ${cmd}. Type 'help' for available commands.`
          );
        }
    }
  };

  const handleGoogleLogin = () => {
    addToTerminal("Initiating GOOGLE authentication protocol...");
    addToTerminal("Launching secure authentication window...");

    // Trigger the Google Login button click programmatically
    const googleLoginButton = document.querySelector('[role="button"]');
    if (googleLoginButton) {
      (googleLoginButton as HTMLElement).click();
    } else {
      addToTerminal("Error: Google authentication service not available");
    }
  };

  const handleLogin = async (user: string) => {
    setUsername(user);
    setIsLoading(true);

    addToTerminal(`Authenticating user: ${user}...`);
    addToTerminal("Connecting to server...");

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false);
      addToTerminal("Authentication successful!");
      addToTerminal("Initializing environment...");
      addToTerminal("Redirecting...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (currentCommand.trim()) {
        handleCommand(currentCommand);
        setCurrentCommand("");
      }
    }
  };

  return (
    <div className="tv">
      {/* Hidden Google Login Button - accessible only via terminal command */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              const token = credentialResponse.credential!;
              const res = await axios.post(
                "http://localhost:5001/api/auth/google",
                { token }
              );
              console.log("User data:", res.data.user);
              console.log("JWT:", res.data.token);
              navigate("/");
            } catch (err) {
              console.error("Login failed:", err);
            }
          }}
          onError={() => console.log("Login failed")}
        />
      </div>
      <div id="terminal" ref={terminalRef} className="terminal">
        {terminalOutput.map((line, index) => (
          <div key={index} className="terminal-line">
            {line}
          </div>
        ))}
        {isLoading && (
          <div className="loading-indicator">
            <span>Processing...</span>
          </div>
        )}
        {!isLoading && (
          <div className="input-line">
            <span>E:/&gt; </span>
            {/* Hidden password field to trick autofill */}
            <input
              type="password"
              style={{ position: "absolute", left: "-9999px", opacity: 0 }}
              tabIndex={-1}
              autoComplete="new-password"
            />
            <input
              ref={inputRef}
              type="text"
              value={currentCommand}
              onChange={(e) => setCurrentCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              className="terminal-input"
              placeholder=""
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              data-bwignore="true"
              data-dashlane-ignore="true"
              data-1password-ignore="true"
              data-bitwarden-ignore="true"
              name="command"
              id="command"
              role="textbox"
              aria-label="Terminal command input"
            />
          </div>
        )}
      </div>
      <div className="flicker"></div>
      <div className="scanlines"></div>
      <div className="noise"></div>
    </div>
  );
};

export default LoginPage;
