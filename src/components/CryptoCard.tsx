import React from 'react';
import { CryptoData } from '../types/types';

interface Props {
    data: CryptoData;
    active?: boolean;
    onClick?: () => void;
}

const CryptoCard: React.FC<Props> = ({ data, active, onClick }) => {
    const { name, current_price, price_change_percentage_24h, image } = data;
    const positive = price_change_percentage_24h >= 0;
    const color = positive ? 'text-green-400' : 'text-red-400';
    const arrow = positive ? '▲' : '▼';

    return (
        <button
            onClick={onClick}
            className={`w-full bg-gray-800 rounded-2xl p-6 flex flex-col items-center shadow-lg transition-transform hover:scale-105 focus:outline-none ${active ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900' : ''
                }`}
        >
            <div className='rounded-lg border px-2 pt-2 border-purple-700'>
                <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 rounded-full mb-3"
                />
            </div>
            <div className="text-center">
                <div className="text-white font-bold">{name}</div>
                <div className="text-2xl text-blue-400 font-semibold">${current_price.toFixed(2)}</div>
                <div className={`text-sm mt-2 ${color}`}>
                    {arrow} {price_change_percentage_24h.toFixed(2)}% (24h)
                </div>
            </div>
        </button>
    );
};

export default CryptoCard;




