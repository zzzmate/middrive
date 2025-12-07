"use client";

export default function NotFound() {
  const handleDiscordClick = () => {
    window.open("https://discord.gg/hayaru", "_blank");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-4">
      <h1 className="text-5xl font-bold mb-4">404</h1>
      <p className="text-neutral-400 text-md mb-8">
        The page you're looking for doesn't exist.
      </p>
      <img
        src="https://i.pinimg.com/originals/e4/b3/68/e4b3684eb437e16763bdbbe98a890863.gif"
        className="w-[300px] h-auto mb-8"
        alt=""
      />

      <div className="flex gap-4">
        <a
          href="/"
          className="flex items-center justify-center bg-white text-black px-12 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Home
        </a>
      </div>
    </div>
  );
}
