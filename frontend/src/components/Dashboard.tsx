import { useState, useEffect } from 'react';
import axios from 'axios';
import type { RececaoUva } from '../types';
import { Search, Grape, Calendar, TrendingUp, Users, Loader2, AlertCircle } from 'lucide-react';

export default function Dashboard() {
    const [data, setData] = useState<RececaoUva[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search & Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampanha, setSelectedCampanha] = useState('');
    const [selectedCasta, setSelectedCasta] = useState('');
    const [selectedProcesso, setSelectedProcesso] = useState('');
    const [selectedSubFamilia, setSelectedSubFamilia] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get<RececaoUva[]>('http://localhost:3001/api/rececao-uvas');
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError('Ocorreu um erro ao carregar os dados. Verifique se o servidor está ativo.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Extract unique options for filters
    const campanhas = Array.from(new Set(data.map(item => item.Campanha))).filter(Boolean).sort();
    const castas = Array.from(new Set(data.map(item => item.DescricaoCasta))).filter(Boolean).sort();
    const processos = Array.from(new Set(data.map(item => item.DescricaoProcesso))).filter(Boolean).sort();
    const subfamilias = Array.from(new Set(data.map(item => item.DescricaoSubFamilia))).filter(Boolean).sort();

    const filteredData = data.filter(item => {
        const matchSearch = item.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.CodSocio?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchCampanha = selectedCampanha === '' || item.Campanha === selectedCampanha;
        const matchCasta = selectedCasta === '' || item.DescricaoCasta === selectedCasta;
        const matchProcesso = selectedProcesso === '' || item.DescricaoProcesso === selectedProcesso;
        const matchSubFamilia = selectedSubFamilia === '' || item.DescricaoSubFamilia === selectedSubFamilia;

        return matchSearch && matchCampanha && matchCasta && matchProcesso && matchSubFamilia;
    });

    const totalPeso = filteredData.reduce((acc, curr) => acc + (curr.PesoLiquido || 0), 0);
    const avgGrau = filteredData.length > 0
        ? filteredData.reduce((acc, curr) => acc + (curr.Grau || 0), 0) / filteredData.length
        : 0;
    const uniqueSocios = new Set(filteredData.map(item => item.CodSocio)).size;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-wine-50">
                <div className="flex flex-col items-center text-wine-800">
                    <Loader2 className="w-12 h-12 animate-spin mb-4" />
                    <h2 className="text-xl font-semibold">A carregar dados...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-wine-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100 flex flex-col items-center text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro de Conexão</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-wine-600 text-white rounded-lg hover:bg-wine-700 transition-colors font-medium"
                    >
                        Tentar Novamente
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & Filters */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col space-y-6">
                    <header className="flex flex-col md:flex-row justify-between items-start md:items-center w-full">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="w-14 h-14 bg-wine-100 rounded-xl flex items-center justify-center text-wine-600">
                                <Grape size={32} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Recepção de Uvas</h1>
                                <p className="text-gray-500 text-sm">Painel de Controlo e Registos</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Pesquisar sócio..."
                                className="pl-10 pr-4 py-2 w-full bg-gray-50 border-gray-200 border rounded-xl focus:ring-2 focus:ring-wine-500 focus:border-wine-500 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Campanha</label>
                            <select
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-wine-500 focus:border-wine-500 block w-full p-2.5 outline-none"
                                value={selectedCampanha}
                                onChange={(e) => setSelectedCampanha(e.target.value)}
                            >
                                <option value="">Todas as Campanhas</option>
                                {campanhas.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo</label>
                            <select
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-wine-500 focus:border-wine-500 block w-full p-2.5 outline-none"
                                value={selectedSubFamilia}
                                onChange={(e) => setSelectedSubFamilia(e.target.value)}
                            >
                                <option value="">Todos os Tipos</option>
                                {subfamilias.map(sf => <option key={sf} value={sf}>{sf}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Casta</label>
                            <select
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-wine-500 focus:border-wine-500 block w-full p-2.5 outline-none"
                                value={selectedCasta}
                                onChange={(e) => setSelectedCasta(e.target.value)}
                            >
                                <option value="">Todas as Castas</option>
                                {castas.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Processo Vindima</label>
                            <select
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-wine-500 focus:border-wine-500 block w-full p-2.5 outline-none"
                                value={selectedProcesso}
                                onChange={(e) => setSelectedProcesso(e.target.value)}
                            >
                                <option value="">Todos os Processos</option>
                                {processos.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* KPIs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-white border-l-4 border-l-wine-500 flex items-center space-x-4">
                        <div className="p-3 bg-wine-50 rounded-lg text-wine-600">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Entregas</p>
                            <h3 className="text-3xl font-bold text-gray-900">{filteredData.length}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-white border-l-4 border-l-emerald-500 flex items-center space-x-4">
                        <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Peso Total (Kg)</p>
                            <h3 className="text-3xl font-bold text-gray-900">{totalPeso.toLocaleString('pt-PT')}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-white border-l-4 border-l-blue-500 flex items-center space-x-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Sócios Ativos</p>
                            <h3 className="text-3xl font-bold text-gray-900">{uniqueSocios}</h3>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-white border-l-4 border-l-purple-500 flex items-center space-x-4">
                        <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-lg">%</div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Grau Médio</p>
                            <h3 className="text-3xl font-bold text-gray-900">{avgGrau.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>

                {/* Tabela de Dados */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-lg font-semibold text-gray-800">Registos Detalhados</h2>
                    </div>
                    <div className="overflow-x-auto max-h-[600px]">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600 font-medium sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-4">Sócio</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">Campanha</th>
                                    <th className="px-6 py-4">Casta</th>
                                    <th className="px-6 py-4">Processo</th>
                                    <th className="px-6 py-4 text-right">Peso (Kg)</th>
                                    <th className="px-6 py-4 text-right">Grau</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-gray-700">
                                {filteredData.slice(0, 100).map((row, idx) => (
                                    <tr key={idx} className="hover:bg-wine-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{row.CodSocio}</div>
                                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.nome}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {row.DescricaoSubFamilia || '-'}
                                        </td>
                                        <td className="px-6 py-4"><span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{row.Campanha}</span></td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-wine-800">{row.DescricaoCasta}</div>
                                        </td>
                                        <td className="px-6 py-4">{row.DescricaoProcesso}</td>
                                        <td className="px-6 py-4 text-right font-medium">{row.PesoLiquido?.toLocaleString('pt-PT')}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${(row.Grau || 0) > 13 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {row.Grau?.toFixed(1) || '0.0'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length > 100 && (
                            <div className="p-4 text-center text-sm text-gray-500 border-t border-gray-100 bg-gray-50/50">
                                Mostrando os primeiros 100 registos de {filteredData.length}. Use a pesquisa para refinar.
                            </div>
                        )}
                        {filteredData.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                Nenhum registo encontrado.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
