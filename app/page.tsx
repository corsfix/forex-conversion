"use client";

import { useState, useEffect } from "react";

interface ConversionResult {
  from: string;
  to: string;
  amount: number;
  value: number;
  timestamp: number;
}

// Cache for exchange rates - stores both directions
const exchangeRateCache: Record<string, number> = {};

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
];

export default function Home() {
  const [fromCurrency, setFromCurrency] = useState("GBP");
  const [toCurrency, setToCurrency] = useState("USD");
  const [amount, setAmount] = useState("");
  const [convertedAmount, setConvertedAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastEditedField, setLastEditedField] = useState<"from" | "to">("from");

  const getCachedRate = (from: string, to: string): number | null => {
    const cacheKey = `${from}${to}`;
    return exchangeRateCache[cacheKey] || null;
  };

  const setCachedRate = (from: string, to: string, rate: number) => {
    // Store the direct rate
    exchangeRateCache[`${from}${to}`] = rate;

    // Store the inverse rate for the opposite direction
    exchangeRateCache[`${to}${from}`] = 1 / rate;
  };

  const handleConvert = async (
    fromAmount: string,
    reverse: boolean = false
  ) => {
    const numAmount = Number(fromAmount);
    if (!fromAmount || isNaN(numAmount) || numAmount <= 0) {
      if (reverse) {
        setAmount("");
      } else {
        setConvertedAmount("");
      }
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const sourceCurrency = reverse ? toCurrency : fromCurrency;
      const targetCurrency = reverse ? fromCurrency : toCurrency;

      let exchangeRate = getCachedRate(sourceCurrency, targetCurrency);

      if (exchangeRate === null) {
        // Need to fetch from API - always fetch rate for 1 unit to standardize
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "{{FINAGE_API_KEY}}";
        const response = await fetch(
          `https://proxy.corsfix.com/?https://api.finage.co.uk/convert/forex/${sourceCurrency}/${targetCurrency}/1?apikey=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch conversion data");
        }

        const data: ConversionResult = await response.json();
        exchangeRate = data.value;
        setCachedRate(sourceCurrency, targetCurrency, exchangeRate);
      }

      const convertedValue = numAmount * exchangeRate;

      if (reverse) {
        setAmount(convertedValue.toFixed(2));
      } else {
        setConvertedAmount(convertedValue.toFixed(2));
      }
    } catch (err) {
      setError("Failed to convert currency. Please try again.");
      console.error("Conversion error:", err);
      if (reverse) {
        setAmount("");
      } else {
        setConvertedAmount("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const swapCurrencies = () => {
    const tempCurrency = fromCurrency;
    const tempAmount = amount;

    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);
    setAmount(convertedAmount);
    setConvertedAmount(tempAmount);
  };

  const getCurrencyIcon = (currencyCode: string) => {
    const icons: Record<string, { bg: string; text: string }> = {
      EUR: { bg: "bg-blue-600", text: "EU" },
      GBP: { bg: "bg-red-600", text: "GB" },
      USD: { bg: "bg-green-600", text: "US" },
      JPY: { bg: "bg-red-500", text: "JP" },
      CAD: { bg: "bg-red-600", text: "CA" },
      AUD: { bg: "bg-blue-500", text: "AU" },
      CHF: { bg: "bg-red-600", text: "CH" },
      CNY: { bg: "bg-red-600", text: "CN" },
    };
    return (
      icons[currencyCode] || {
        bg: "bg-gray-600",
        text: currencyCode.slice(0, 2),
      }
    );
  };

  // Auto-convert when amount or currencies change
  useEffect(() => {
    if (lastEditedField === "from" && amount) {
      const timeoutId = setTimeout(() => {
        handleConvert(amount, false);
      }, 300); // Debounce API calls
      return () => clearTimeout(timeoutId);
    }
  }, [amount, fromCurrency, toCurrency, lastEditedField]);

  useEffect(() => {
    if (lastEditedField === "to" && convertedAmount) {
      const timeoutId = setTimeout(() => {
        handleConvert(convertedAmount, true);
      }, 300); // Debounce API calls
      return () => clearTimeout(timeoutId);
    }
  }, [convertedAmount, fromCurrency, toCurrency, lastEditedField]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setLastEditedField("from");
  };

  const handleConvertedAmountChange = (value: string) => {
    setConvertedAmount(value);
    setLastEditedField("to");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 to-indigo-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Exchange Rate Display */}

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <div className="space-y-6">
            {/* Amount Input with Currency Selector */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="1"
                  className="w-full px-6 py-6 pr-32 border-2 border-gray-300 text-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-2xl font-semibold"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
                  <div
                    className={`w-8 h-8 ${
                      getCurrencyIcon(fromCurrency).bg
                    } rounded-full flex items-center justify-center mr-3`}
                  >
                    <span className="text-white text-xs font-bold">
                      {getCurrencyIcon(fromCurrency).text}
                    </span>
                  </div>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="bg-transparent text-xl font-semibold text-gray-800 border-none outline-none appearance-none cursor-pointer"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 ml-1 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center">
              <button
                onClick={swapCurrencies}
                className="w-12 h-12 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center transition-colors"
                title="Swap currencies"
              >
                <svg
                  className="w-6 h-6 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </button>
            </div>

            {/* Converted Amount Display */}
            <div>
              <label className="block text-lg font-medium text-gray-800 mb-4">
                Converted to
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={convertedAmount}
                  onChange={(e) => handleConvertedAmountChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-6 py-6 pr-32 border-2 border-gray-300 text-gray-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-2xl font-semibold"
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
                  <div
                    className={`w-8 h-8 ${
                      getCurrencyIcon(toCurrency).bg
                    } rounded-full flex items-center justify-center mr-3`}
                  >
                    <span className="text-white text-xs font-bold">
                      {getCurrencyIcon(toCurrency).text}
                    </span>
                  </div>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="bg-transparent text-xl font-semibold text-gray-800 border-none outline-none appearance-none cursor-pointer"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="w-4 h-4 ml-1 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
