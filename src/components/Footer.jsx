import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-surface relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-bg-cta opacity-50 pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
                F
              </div>
              <span className="text-lg font-semibold">
                Furni <span className="gradient-text">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Design your dream furniture with the power of artificial intelligence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-2.5">
              {["Builder", "Gallery", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2.5">
              {["About", "Contact", "Careers"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-muted hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-muted hover:text-white transition-colors cursor-pointer">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Furni AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "LinkedIn"].map((social) => (
              <span
                key={social}
                className="text-xs text-muted hover:text-white transition-colors cursor-pointer"
              >
                {social}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
