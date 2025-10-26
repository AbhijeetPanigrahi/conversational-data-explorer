import React from "react";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Conversational Data Explorer</h1>
        <div>
          <a
            href="https://github.com/AbhijeetPanigrahi/"
            className="hover:text-blue-200 transition-colors duration-300"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
