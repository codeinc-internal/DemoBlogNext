"use client";

import React, { ReactNode } from "react";

interface CartoonCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

const CartoonCard: React.FC<CartoonCardProps> = ({
  title,
  subtitle,
  children,
  className = "",
}) => {
  return (
    <div
      className={`relative w-full max-w-md bg-white rounded-3xl p-8 border-4 border-black shadow-[6px_6px_0_#000] transition-transform duration-200 hover:scale-[1.01] ${className}`}
    >
      <h2
        className="text-3xl font-extrabold text-center"
        style={{ textShadow: "3px 3px 0px #ffdd57" }}
      >
        {title}
      </h2>

      {subtitle && (
        <p className="text-center text-gray-600 font-medium mt-1 mb-4">
          {subtitle}
        </p>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
};

export default CartoonCard;
