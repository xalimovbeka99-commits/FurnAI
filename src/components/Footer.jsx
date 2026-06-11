import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/75 backdrop-blur-md relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/25">
                F
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Furni<span className="gradient-text-warm font-extrabold">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Design your dream furniture with the power of artificial intelligence.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white uppercase tracking-wider text-xs">Product</h4>
            <ul className="space-y-2.5">
              {["Builder", "Gallery", "Pricing"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-muted hover:text-white transition-colors hover:translate-x-1 inline-block duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-2.5">
              {["About", "Contact", "Careers"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-muted hover:text-white transition-colors hover:translate-x-1 inline-block duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-white uppercase tracking-wider text-xs">Legal</h4>
            <ul className="space-y-2.5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
                (item) => (
                  <li key={item}>
                    <span className="text-sm text-muted hover:text-white transition-colors hover:translate-x-1 inline-block duration-300 cursor-pointer">
                      {item}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
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
