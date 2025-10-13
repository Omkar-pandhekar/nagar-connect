"use client";

export default function CtaSection() {
  return (
    <section className="bg-[#2A64F5] py-12 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Take Action on the Go
          </h2>
          <p className="mt-3 text-white/90 text-sm sm:text-base">
            Report issues, upload photos, and track resolutions from anywhere
            with the Nagar-Connect app.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#appstore"
              className="inline-flex items-center gap-3 rounded-md bg-white px-4 py-2 text-gray-900 shadow hover:opacity-90"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-900"
              >
                <path d="M16.365 1.43c0 1.14-.414 2.18-1.097 2.99-.79.96-2.094 1.7-3.208 1.6-.15-1.13.47-2.28 1.167-3.05.82-.9 2.246-1.64 3.138-1.54zM21.6 17.23c-.58 1.34-1.3 2.6-2.18 3.74-1.17 1.52-2.12 2.88-3.84 2.91-1.67.03-2.2-.94-4.09-.94-1.9 0-2.48.91-4.13.97-1.7.06-3-1.64-4.18-3.15C1.2 18.3.18 15.54.15 12.93c-.03-2.42.78-4.64 2.32-6.17 1.23-1.21 2.86-1.94 4.56-1.97 1.79-.03 3.47 1 4.08 1 .6 0 2.82-1.24 4.77-1.06.81.03 2.97.33 4.38 2 .1.07-3.88 2.26-3.84 6.73.04 4.27 3.41 5.67 3.48 5.68z" />
              </svg>
              <span className="text-sm font-semibold">App Store</span>
            </a>
            <a
              href="#playstore"
              className="inline-flex items-center gap-3 rounded-md bg-white px-4 py-2 text-gray-900 shadow hover:opacity-90"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="text-gray-900"
              >
                <path d="M3.6 1.8l10.2 10.2L3.6 22.2V1.8zm11.7 11.7l3.7 3.7c.9.9.5 2.4-.8 2.9L7.5 24l7.8-7.8zM7.5 0l10.7 3.6c1.3.4 1.7 2 .8 2.9l-3.7 3.7L7.5 0z" />
              </svg>
              <span className="text-sm font-semibold">Google Play</span>
            </a>
          </div>
        </div>
        {/* <div className="relative h-[420px] w-full">
          <Image
            src="https://placehold.co/300x600/FFFFFF/CCCCCC?text=App+Screenshot"
            alt="App Screenshot"
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            style={{ objectFit: "contain" }}
          />
        </div> */}
      </div>
    </section>
  );
}
