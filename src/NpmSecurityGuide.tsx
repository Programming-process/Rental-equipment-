type NpmSecurityGuideProps = {
  onBack: () => void;
};

const protections = [
  {
    number: "01",
    title: "Protect publisher accounts",
    label: "ACCOUNT",
    description:
      "Require phishing-resistant 2FA where available, use granular access tokens, and remove stale maintainers. Prefer trusted publishing from CI over long-lived publish tokens.",
  },
  {
    number: "02",
    title: "Verify package integrity",
    label: "INTEGRITY",
    description:
      "Commit package-lock.json and install with npm ci. Lockfiles pin the dependency tree and include integrity hashes so unexpected package changes can be detected.",
  },
  {
    number: "03",
    title: "Reduce dependency risk",
    label: "DEPENDENCIES",
    description:
      "Review npm audit findings, transitive dependencies, ownership changes, release activity, and package lifecycle scripts before adding or upgrading packages.",
  },
  {
    number: "04",
    title: "Harden CI and runtime",
    label: "PIPELINE",
    description:
      "Use least-privilege CI permissions, keep secrets out of logs, pin trusted actions, and avoid running install scripts when the project does not need them.",
  },
];

const incidentSteps = [
  {
    step: "01",
    title: "Triage",
    description:
      "Confirm the affected package and version. Check whether the vulnerable code is present, reachable, and exposed in your deployed application.",
  },
  {
    step: "02",
    title: "Contain",
    description:
      "Pause affected releases, revoke compromised tokens, and apply a temporary mitigation if a safe patched version is not yet available.",
  },
  {
    step: "03",
    title: "Remediate",
    description:
      "Update to a verified fixed version, regenerate and review the lockfile, then run tests and a fresh dependency scan.",
  },
  {
    step: "04",
    title: "Recover",
    description:
      "Deploy the verified fix, monitor for suspicious activity, rotate exposed credentials, and record the incident and follow-up actions.",
  },
];

export default function NpmSecurityGuide({ onBack }: NpmSecurityGuideProps) {
  return (
    <div className="min-h-screen bg-[#f4f6f3] text-[#18211e]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5">
        <button
          className="flex items-center gap-3 rounded-full bg-[#101a17] px-5 py-3 text-white shadow-lg"
          onClick={onBack}
          type="button"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full bg-[#b4f36a] text-sm font-black text-[#17220e]">
            R
          </span>
          <span className="text-sm font-bold">RentOps</span>
        </button>
        <button
          className="rounded-full border border-[#cfd8d1] bg-white px-4 py-2 text-sm font-semibold transition hover:bg-[#edf2ed]"
          onClick={onBack}
          type="button"
        >
          Back to dashboard
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-4 pb-16">
        <section className="relative overflow-hidden rounded-[32px] bg-[#101a17] px-6 py-8 text-white shadow-[0_28px_70px_rgba(16,26,23,0.18)] md:px-10 md:py-12">
          <div className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border border-[#b4f36a]/15" />
          <div className="pointer-events-none absolute -right-4 -top-12 h-56 w-56 rounded-full border border-[#b4f36a]/20" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.95fr]">
            <div className="flex flex-col justify-center">
              <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#b4f36a]/25 bg-[#b4f36a]/10 px-3 py-1.5 text-[10px] font-bold tracking-[0.18em] text-[#c9ff92] uppercase">
                <span className="h-2 w-2 rounded-full bg-[#b4f36a]" />
                npm security field guide
              </div>
              <h1 className="max-w-2xl text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-6xl">
                Secure every step of your npm supply chain.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#c0cbc4]">
                A practical overview of npm account, package, dependency, and
                CI/CD safeguards — plus a clear response plan for critical
                vulnerabilities.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  className="rounded-full bg-[#b4f36a] px-5 py-3 text-sm font-bold text-[#17220e] transition hover:brightness-105"
                  href="#critical-response"
                >
                  Critical response plan
                </a>
                <a
                  className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  href="#daily-checklist"
                >
                  View the checklist
                </a>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-[#18241f]/90 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold tracking-[0.18em] text-[#9caaa1] uppercase">
                    Supply-chain control map
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight">
                    Protect the full path
                  </h2>
                </div>
                <span className="rounded-full bg-[#b4f36a]/10 px-3 py-1 text-[10px] font-bold text-[#c9ff92]">
                  5 CONTROL POINTS
                </span>
              </div>
              <div className="mt-6 grid gap-2 sm:grid-cols-5">
                {[
                  ["01", "Author", "2FA + access"],
                  ["02", "Publish", "Trusted CI"],
                  ["03", "Registry", "Provenance"],
                  ["04", "Install", "Lock + verify"],
                  ["05", "Run", "Least privilege"],
                ].map(([number, title, detail], index) => (
                  <div className="relative" key={number}>
                    <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                      <span className="text-[10px] font-bold text-[#b4f36a]">
                        {number}
                      </span>
                      <p className="mt-3 text-sm font-bold">{title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-[#aab7ae]">
                        {detail}
                      </p>
                    </div>
                    {index < 4 && (
                      <span className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-[#b4f36a] sm:block">
                        →
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-[#b4f36a]/20 bg-[#b4f36a]/[0.07] p-4 text-sm leading-6 text-[#d9e7dc]">
                Security is layered: provenance helps verify where a package
                came from, while lockfiles and integrity checks help ensure the
                installed bytes match what was resolved. Neither replaces
                review, scanning, or safe runtime configuration.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["npm ci", "Reproducible CI installs"],
            ["2FA", "Stronger publisher accounts"],
            ["Provenance", "Verifiable build origin"],
            ["npm audit", "Known advisory visibility"],
          ].map(([title, description]) => (
            <div
              className="rounded-[20px] border border-[#e0e6df] bg-white p-4 shadow-sm"
              key={title}
            >
              <p className="font-mono text-lg font-bold text-[#28733c]">
                {title}
              </p>
              <p className="mt-1 text-xs text-[#66736b]">{description}</p>
            </div>
          ))}
        </section>

        <section
          aria-labelledby="audit-results-title"
          className="mt-8 rounded-[28px] border border-[#e0e6df] bg-white p-5 shadow-sm md:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#68806f] uppercase">
                Сүүлийн шалгалтын үр дүн
              </p>
              <h2
                className="mt-2 text-2xl font-black tracking-[-0.04em]"
                id="audit-results-title"
              >
                npm audit-ийн үр дүн
              </h2>
              <p className="mt-2 text-sm text-[#66736b]">
                Үйлдвэрлэлийн 3 хамаарлыг{" "}
                <code className="font-mono">pnpm audit --prod</code>
                {" "}командаар шалгав.
              </p>
            </div>
            <span className="rounded-full bg-[#eef5eb] px-3 py-1.5 text-xs font-bold text-[#28733c]">
              ҮЙЛДВЭРЛЭЛ: АСУУДАЛГҮЙ
            </span>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[#e0e6df] text-xs text-[#66736b]">
                  <th className="px-3 py-3 font-semibold" scope="col">
                    Ноцтой байдал
                  </th>
                  <th className="px-3 py-3 text-right font-semibold" scope="col">
                    Үйлдвэрлэл
                  </th>
                  <th className="px-3 py-3 text-right font-semibold" scope="col">
                    Бүтэн төсөл
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Маш өндөр", "0", "0"],
                  ["Өндөр", "0", "8"],
                  ["Дунд", "0", "6"],
                  ["Бага", "0", "1"],
                ].map(([severity, production, fullProject]) => (
                  <tr
                    className="border-b border-[#edf0ec] last:border-0"
                    key={severity}
                  >
                    <th className="px-3 py-3 font-semibold" scope="row">
                      {severity}
                    </th>
                    <td className="px-3 py-3 text-right font-mono text-[#28733c]">
                      {production}
                    </td>
                    <td className="px-3 py-3 text-right font-mono">
                      {fullProject}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 rounded-2xl bg-[#f4f7f2] p-4 text-xs leading-5 text-[#536158]">
            Үйлдвэрлэлийн хамаарлуудаас асуудал илрээгүй бөгөөд маш өндөр
            түвшний анхааруулга алга. Бүтэн хамаарлын модонд мөн маш өндөр
            түвшний анхааруулга байхгүй ч хөгжүүлэлтийн хамаарлуудаас 15
            анхааруулга илэрсэн (8 өндөр, 6 дунд, 1 бага). Төслийг бүхэлд нь
            асуудалгүй гэж үзэхээс өмнө эдгээрийг шалгана уу.
          </p>
        </section>

        <section className="mt-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#68806f] uppercase">
                Defense in depth
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                The controls that matter
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#66736b]">
              Use multiple independent safeguards. A clean audit today cannot
              guarantee a dependency is safe tomorrow.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {protections.map((item) => (
              <article
                className="rounded-[24px] border border-[#e0e6df] bg-white p-5 shadow-[0_10px_30px_rgba(21,35,25,0.04)]"
                key={item.number}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-[#28733c]">
                    {item.number}
                  </span>
                  <span className="rounded-full bg-[#eef5eb] px-3 py-1 text-[9px] font-bold tracking-[0.14em] text-[#52705a]">
                    {item.label}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#66736b]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          className="mt-10 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]"
          id="critical-response"
        >
          <div className="rounded-[28px] bg-[#752d24] p-6 text-white shadow-[0_20px_45px_rgba(117,45,36,0.16)] md:p-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold tracking-[0.16em] uppercase">
              <span className="h-2 w-2 rounded-full bg-[#ffba8e]" />
              Critical vulnerability
            </div>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.05em]">
              Treat it as an incident, not just a version bump.
            </h2>
            <p className="mt-4 text-sm leading-6 text-white/80">
              Prioritize active exploitation, reachable vulnerable code,
              production exposure, and available fixes. Severity is important,
              but risk depends on your application and environment.
            </p>
            <div className="mt-6 rounded-2xl border border-white/15 bg-black/10 p-4">
              <p className="text-[10px] font-bold tracking-[0.14em] text-white/65 uppercase">
                Start with
              </p>
              <code className="mt-2 block break-all font-mono text-sm text-white">
                npm audit --omit=dev
              </code>
              <p className="mt-2 text-xs leading-5 text-white/70">
                This focuses on production dependencies; also review the full
                audit output for development and build-tool exposure.
              </p>
            </div>
          </div>
          <div className="rounded-[28px] border border-[#e0e6df] bg-white p-5 shadow-sm md:p-7">
            <h3 className="text-xl font-bold tracking-tight">
              Four-step incident workflow
            </h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {incidentSteps.map((item) => (
                <div
                  className="rounded-2xl bg-[#f4f7f2] p-4"
                  key={item.step}
                >
                  <span className="font-mono text-xs font-bold text-[#28733c]">
                    {item.step} / RESPONSE
                  </span>
                  <h4 className="mt-2 font-bold">{item.title}</h4>
                  <p className="mt-1 text-xs leading-5 text-[#66736b]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="mt-10 rounded-[28px] bg-[#101a17] p-6 text-white md:p-8"
          id="daily-checklist"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.18em] text-[#b4f36a] uppercase">
                Team baseline
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">
                Practical npm checklist
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-[#b9c5bc]">
              Make these steps part of code review, CI, release, and incident
              response—not a one-time setup.
            </p>
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {[
              "Commit package-lock.json and use npm ci in automated builds.",
              "Run npm audit and review advisory details before applying fixes.",
              "Use 2FA and short-lived, narrowly scoped publishing credentials.",
              "Enable provenance for supported publishing workflows and verify it when consuming packages.",
              "Review install scripts and use --ignore-scripts only when compatible with the project.",
              "Keep Node.js and npm supported and patched; protect CI secrets and permissions.",
            ].map((item) => (
              <div
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                key={item}
              >
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#b4f36a] text-xs font-black text-[#17220e]">
                  ✓
                </span>
                <p className="text-sm leading-6 text-[#e1e9e3]">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-[#aebbb2]">
            <strong className="text-white">Important:</strong> npm audit reports
            known advisories; it is not a complete malware detector or a
            guarantee of safety. Validate fixes, inspect package provenance
            where available, and follow your organization’s incident policy.
          </div>
        </section>
      </main>
    </div>
  );
}
