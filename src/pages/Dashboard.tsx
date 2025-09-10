import { useMemo, useState } from "react";
import CryptoCard from "../components/CryptoCard";
import PriceChart from "../components/PriceChart";
import { CryptoData } from "../types/types";
import { useCryptoPrices } from "../hooks/useCryptoPrices";
import { useCryptoChart } from "../hooks/useCryptoChart";

const COINS = ["bitcoin", "ethereum", "dogecoin"];

const Dashboard: React.FC = () => {

    const [selectedCoin, setSelectedCoin] = useState("bitcoin");

    // Cards (BTC, ETH, DOGE) hook
    const { cryptoData, loading } = useCryptoPrices(COINS);

    // Chart (only selected) hook
    const { chartData, chartLoading, chartError } = useCryptoChart(selectedCoin);

    const selectedInfo = useMemo(
        () => cryptoData.find((c: CryptoData) => c.id === selectedCoin),
        [cryptoData, selectedCoin]
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <div className="ml-4 text-xl">Loading prices...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6 sm:p-12">
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-5xl font-extrabold text-blue-500">
                    Live Crypto Dashboard
                </h1>
                {selectedInfo && (
                    <div className="mt-6 flex items-center justify-center gap-4">
                        <div className='rounded-lg border px-2 pt-2 border-purple-700'>
                            <img
                                src={selectedInfo.image}
                                alt={selectedInfo.name}
                                className="w-16 h-16 rounded-full mb-3"
                            />
                        </div>

                        <div className="text-left">
                            <div className="text-xl font-semibold">
                                {selectedInfo.name} ({selectedInfo.symbol.toUpperCase()})
                            </div>
                            <div className="text-blue-400 text-lg">
                                ${selectedInfo.current_price.toLocaleString()}
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {COINS.map((id) => {
                    const coin = cryptoData.find((c) => c.id === id);
                    if (!coin) return null;
                    return (
                        <CryptoCard
                            key={id}
                            data={coin}
                            active={selectedCoin === id}
                            onClick={() => setSelectedCoin(id)}
                        />
                    );
                })}
            </div>

            {/* Chart */}
            <PriceChart
                data={chartData}
                coinName={selectedInfo?.name ?? selectedCoin}
                loading={chartLoading}
                error={chartError}
            />

            <footer className="text-center mt-10 text-gray-500 text-sm">
                Data provided by CoinGecko API. Prices refresh every 30 seconds.
            </footer>
        </div>
    );
};

export default Dashboard;
