import { useState, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import type { RececaoUva } from '../types';

interface OrigensAnalyticsProps {
    data: RececaoUva[];
}

const COLORS = ['#8f204d', '#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

export default function OrigensAnalytics({ data }: OrigensAnalyticsProps) {
    const [selectedSocio, setSelectedSocio] = useState<string>('');
    const [selectedPropriedade, setSelectedPropriedade] = useState<string>('');

    // Extrair Sócios Únicos
    const socios = useMemo(() => {
        return Array.from(new Set(data.map(item => item.nome || item.CodSocio || ''))).filter(Boolean).sort();
    }, [data]);

    // Extrair Propriedades (Dependentes do Sócio Selecionado)
    const propriedades = useMemo(() => {
        if (!selectedSocio) return [];
        return Array.from(
            new Set(
                data
                    .filter(item => (item.nome === selectedSocio || item.CodSocio === selectedSocio) && item.DescricaoPropriedade)
                    .map(item => item.DescricaoPropriedade)
            )
        ).sort();
    }, [data, selectedSocio]);

    // Reset da Propriedade se o Sócio mudar
    function handleSocioChange(e: React.ChangeEvent<HTMLSelectElement>) {
        setSelectedSocio(e.target.value);
        setSelectedPropriedade('');
    }

    // Criar os Dados para o Gráfico das Parcelas
    const parcelasData = useMemo(() => {
        const map = new Map<string, number>();

        // Filtramos pelos que estão selecionados
        data.forEach(item => {
            const matchSocio = selectedSocio === '' || item.nome === selectedSocio || item.CodSocio === selectedSocio;
            const matchPropriedade = selectedPropriedade === '' || item.DescricaoPropriedade === selectedPropriedade;

            if (matchSocio && matchPropriedade) {
                // O nome do eixo deve mostrar a Hierarquia se não houver um Sócio/Propriedade fixo
                let label = '';
                if (!selectedSocio && !selectedPropriedade) {
                    const shortSocio = (item.nome || item.CodSocio || 'Desc').substring(0, 15);
                    label = `${shortSocio} › ${item.DescricaoPropriedade || 'S/P'} › ${item.DescricaoParcela || 'S/P'}`;
                } else if (selectedSocio && !selectedPropriedade) {
                    label = `${item.DescricaoPropriedade || 'S/P'} › ${item.DescricaoParcela || 'S/P'}`;
                } else {
                    label = item.DescricaoParcela || 'Sem Parcela';
                }

                map.set(label, (map.get(label) || 0) + (item.PesoLiquido || 0));
            }
        });

        return Array.from(map.entries())
            .map(([name, peso]) => ({ name, peso: Math.round(peso) }))
            .sort((a, b) => b.peso - a.peso)
            .slice(0, 30); // Mostrar até ao Top 30 para não sobrecarregar
    }, [data, selectedSocio, selectedPropriedade]);

    // Tooltip Customizado
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 shadow-md rounded-lg">
                    <p className="font-semibold text-slate-800 text-sm mb-1">{label}</p>
                    <p className="text-wine-600 font-bold text-sm">
                        {payload[0].value.toLocaleString('pt-PT')} <span className="text-slate-500 font-medium text-xs">Kg</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-4">

            {/* Header / Filtros do Gráfico */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900 tracking-tight">Gráfico por Parcela</h2>
                    <p className="text-xs font-medium text-slate-500">
                        {selectedSocio && selectedPropriedade
                            ? `Exibindo Parcelas da propriedade ${selectedPropriedade} do sócio ${selectedSocio}`
                            : selectedSocio
                                ? `Exibindo o Top 30 das Propriedades e Parcelas do sócio ${selectedSocio}`
                                : 'Exibindo o Top 30 Mundial de Entregas Sócio/Propriedade/Parcela'}
                    </p>
                </div>

                <div className="flex space-x-3 w-full md:w-auto">
                    <select
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500 block w-full md:w-48 p-2 outline-none font-medium shadow-sm cursor-pointer"
                        value={selectedSocio}
                        onChange={handleSocioChange}
                    >
                        <option value="">Todos os Sócios</option>
                        {socios.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <select
                        className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500 block w-full md:w-48 p-2 outline-none font-medium shadow-sm cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                        value={selectedPropriedade}
                        onChange={(e) => setSelectedPropriedade(e.target.value)}
                        disabled={!selectedSocio || propriedades.length === 0}
                    >
                        <option value="">Todas as Propriedades</option>
                        {propriedades.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            {/* Gráfico */}
            <div className="p-6">
                {parcelasData.length > 0 ? (
                    <div className="h-[600px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={parcelasData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                                <XAxis type="number" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} tick={{ fontSize: 12, fill: '#6B7280' }} />
                                <YAxis dataKey="name" type="category" width={320} tick={{ fontSize: 11, fill: '#374151', fontWeight: 500 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="peso" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16}>
                                    {parcelasData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-64 flex items-center justify-center text-slate-500 font-medium bg-slate-50/50 rounded-lg border border-slate-100">
                        Nenhum dado encontrado para a seleção atual.
                    </div>
                )}
            </div>

        </div>
    );
}
