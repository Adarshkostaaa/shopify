import React, { useState, useRef, useEffect } from 'react';
import { Shield, CreditCard, CheckCircle, XCircle, Clock, Zap, Terminal, Lock, Pause, Play } from 'lucide-react';

interface CheckResult {
  card: string;
  status: 'approved' | 'declined' | 'checking';
  response: string;
  timestamp: string;
  reason?: string;
  cardInfo?: {
    type: string;
    brand: string;
    bank: string;
    country: string;
    flag: string;
  };
  processingTime?: string;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [cards, setCards] = useState('');
  const [results, setResults] = useState<CheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentCard, setCurrentCard] = useState('');
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [filter, setFilter] = useState<'all' | 'approved' | 'declined'>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const resultsRef = useRef<HTMLDivElement>(null);
  const checkingRef = useRef<boolean>(false);
  const pausedRef = useRef<boolean>(false);
  const cardListRef = useRef<string[]>([]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'kamal') {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const getCardInfo = (cardNumber: string) => {
    const cardInfos = [
      { type: 'VISA - CREDIT - TRADITIONAL', brand: 'VISA', bank: 'CITIBANK, N.A.- COSTCO', country: 'UNITED STATES', flag: '🇺🇸' },
      { type: 'VISA - DEBIT - ELECTRON', brand: 'VISA', bank: 'CAIXA GERAL DE DEPOSITOS, S.A.', country: 'PORTUGAL', flag: '🇵🇹' },
      { type: 'MASTERCARD - CREDIT - WORLD', brand: 'MASTERCARD', bank: 'JPMORGAN CHASE BANK, N.A.', country: 'UNITED STATES', flag: '🇺🇸' },
      { type: 'VISA - CREDIT - SIGNATURE', brand: 'VISA', bank: 'BANK OF AMERICA, N.A.', country: 'UNITED STATES', flag: '🇺🇸' },
      { type: 'MASTERCARD - DEBIT - STANDARD', brand: 'MASTERCARD', bank: 'WELLS FARGO BANK, N.A.', country: 'UNITED STATES', flag: '🇺🇸' },
      { type: 'VISA - CREDIT - PLATINUM', brand: 'VISA', bank: 'CAPITAL ONE BANK (USA), N.A.', country: 'UNITED STATES', flag: '🇺🇸' },
      { type: 'AMEX - CREDIT - GOLD', brand: 'AMERICAN EXPRESS', bank: 'AMERICAN EXPRESS COMPANY', country: 'UNITED STATES', flag: '🇺🇸' },
      { type: 'VISA - DEBIT - CLASSIC', brand: 'VISA', bank: 'SANTANDER BANK, N.A.', country: 'SPAIN', flag: '🇪🇸' },
      { type: 'MASTERCARD - CREDIT - WORLD ELITE', brand: 'MASTERCARD', bank: 'HSBC BANK USA, N.A.', country: 'UNITED KINGDOM', flag: '🇬🇧' },
      { type: 'VISA - CREDIT - INFINITE', brand: 'VISA', bank: 'TD BANK, N.A.', country: 'CANADA', flag: '🇨🇦' }
    ];
    return cardInfos[Math.floor(Math.random() * cardInfos.length)];
  };

  const processOneCard = async (cardData: string): Promise<CheckResult> => {
    const startTime = Date.now();
    
    // Very fast processing - 20ms delay (50 cards per second)
    await new Promise(resolve => setTimeout(resolve, 20));

    const endTime = Date.now();
    const processingTime = ((endTime - startTime) / 1000).toFixed(2);

    // Only 1.5% approval rate for realism
    const randomNum = Math.random();
    const isApproved = randomNum < 0.015;

    const cardInfo = getCardInfo(cardData);

    // Shopify specific responses
    const approvedResponses = [
      'CVV MATCH - 3ds cc',
      'Order Placed! -> $4',
      'Thank you for your purchase! -> $4'
    ];

    const declinedResponses = [
      'INCORRECT_NUMBER',
      'INVALID_EXPIRY_DATE',
      'INVALID_CVC',
      'CARD_DECLINED',
      'INSUFFICIENT_FUNDS',
      'EXPIRED_CARD',
      'PROCESSING_ERROR',
      'GENERIC_DECLINE'
    ];

    const response = isApproved 
      ? approvedResponses[Math.floor(Math.random() * approvedResponses.length)]
      : declinedResponses[Math.floor(Math.random() * declinedResponses.length)];

    return {
      card: cardData,
      status: isApproved ? 'approved' : 'declined',
      response: `⤿ ${response} ⤾`,
      timestamp: new Date().toLocaleTimeString(),
      reason: isApproved ? undefined : response,
      cardInfo,
      processingTime: `${processingTime} seconds`
    };
  };

  const startChecking = async () => {
    const cardList = cards.split('\n').filter(card => card.trim());
    if (cardList.length === 0) return;

    cardListRef.current = cardList;
    setTotalCards(cardList.length);
    setProcessedCount(0);
    setCurrentIndex(0);
    setIsChecking(true);
    setResults([]);
    checkingRef.current = true;
    pausedRef.current = false;

    // Process cards one by one
    for (let i = 0; i < cardList.length; i++) {
      if (!checkingRef.current) break;

      // Pause functionality
      while (pausedRef.current && checkingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!checkingRef.current) break;

      const cardData = cardList[i].trim();
      setCurrentCard(cardData);
      setCurrentIndex(i + 1);

      try {
        const result = await processOneCard(cardData);
        
        setResults(prev => [...prev, result]);
        setProcessedCount(prev => prev + 1);

      } catch (error) {
        const errorResult: CheckResult = {
          card: cardData,
          status: 'declined',
          response: '⤿ NETWORK_ERROR ⤾',
          timestamp: new Date().toLocaleTimeString(),
          reason: 'Network error'
        };
        setResults(prev => [...prev, errorResult]);
        setProcessedCount(prev => prev + 1);
      }
    }

    setIsChecking(false);
    setCurrentCard('');
    checkingRef.current = false;
  };

  const stopChecking = () => {
    setIsChecking(false);
    checkingRef.current = false;
    pausedRef.current = false;
    setIsPaused(false);
    setCurrentCard('');
  };

  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  };

  const clearResults = () => {
    setResults([]);
    setProcessedCount(0);
    setTotalCards(0);
    setCurrentCard('');
    setCurrentIndex(0);
  };

  // Filter results
  const filteredResults = results.filter(result => {
    if (filter === 'all') return true;
    return result.status === filter;
  });

  const approvedCount = results.filter(r => r.status === 'approved').length;
  const declinedCount = results.filter(r => r.status === 'declined').length;

  // Auto-scroll to latest result
  useEffect(() => {
    if (resultsRef.current) {
      resultsRef.current.scrollTop = resultsRef.current.scrollHeight;
    }
  }, [results]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-400 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-10 h-10 text-gray-900" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              SECURE ACCESS
            </h1>
            <p className="text-gray-400 mt-2">Enter authorization code</p>
          </div>
          
          <form onSubmit={handleAuth}>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Authorization Code"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg"
            >
              ACCESS SYSTEM
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-lg border-b border-purple-500/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-cyan-400 to-purple-400 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-gray-900" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                CYBERPUNK CC CHECKER
              </h1>
              <p className="text-sm text-gray-400">Shopify Gateway 4$ [ /sh ] - by @Mod_By_Kamal</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="text-sm text-gray-400">Status</div>
              <div className={`font-semibold ${isChecking ? 'text-cyan-400' : 'text-green-400'}`}>
                {isChecking ? 'ACTIVE' : 'STANDBY'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Speed</div>
              <div className="font-semibold text-purple-400">50 cards/sec</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Terminal className="w-5 h-5 mr-2 text-cyan-400" />
              Input Panel
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Credit Cards (Format: XXXX|XX|XX|XXX)
                </label>
                <textarea
                  value={cards}
                  onChange={(e) => setCards(e.target.value)}
                  placeholder="4532015112830366|12|2027|123&#10;5425233430109903|11|2026|456&#10;4000000000000002|10|2025|789"
                  className="w-full h-40 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all resize-none"
                  disabled={isChecking}
                />
              </div>

              <div className="flex space-x-2">
                {!isChecking ? (
                  <button
                    onClick={startChecking}
                    disabled={!cards.trim()}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    START CHECK
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePause}
                      className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 transition-all flex items-center justify-center"
                    >
                      {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                      {isPaused ? 'RESUME' : 'PAUSE'}
                    </button>
                    <button
                      onClick={stopChecking}
                      className="flex-1 bg-gradient-to-r from-red-500 to-rose-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-red-600 hover:to-rose-600 transition-all flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      STOP
                    </button>
                  </>
                )}
              </div>

              {results.length > 0 && (
                <button
                  onClick={clearResults}
                  disabled={isChecking}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50 transition-all"
                >
                  CLEAR RESULTS
                </button>
              )}
            </div>

            {/* Progress */}
            {totalCards > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{processedCount}/{totalCards}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(processedCount / totalCards) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Card: {currentIndex}/{totalCards}</span>
                  <span>{Math.round((processedCount / totalCards) * 100)}%</span>
                </div>
                {currentCard && (
                  <div className="text-xs text-gray-400">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1 animate-spin" />
                      Checking: {currentCard}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-lg border border-purple-500/30 rounded-xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center mb-4 sm:mb-0">
                <Zap className="w-5 h-5 mr-2 text-cyan-400" />
                Live Results
              </h2>
              
              {/* Filter Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filter === 'all' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  All ({results.length})
                </button>
                <button
                  onClick={() => setFilter('approved')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filter === 'approved' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Approved ({approvedCount})
                </button>
                <button
                  onClick={() => setFilter('declined')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                    filter === 'declined' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Declined ({declinedCount})
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-green-400">{approvedCount}</div>
                    <div className="text-sm text-green-300">Approved ✅</div>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-red-400">{declinedCount}</div>
                    <div className="text-sm text-red-300">Declined ❌</div>
                  </div>
                  <XCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </div>

            {/* Results List */}
            <div 
              ref={resultsRef}
              className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar"
            >
              {filteredResults.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No results to display</p>
                  <p className="text-sm">Enter credit cards above and click START CHECK</p>
                </div>
              ) : (
                filteredResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border transition-all ${
                      result.status === 'approved'
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Status Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {result.status === 'approved' ? (
                            <>
                              <CheckCircle className="w-5 h-5 text-green-400" />
                              <span className="font-bold text-green-400">𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐝 ✅</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-400" />
                              <span className="font-bold text-red-400">𝐃𝐞𝐜𝐥𝐢𝐧𝐞𝐝 ❌</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{result.timestamp}</div>
                      </div>

                      {/* Card Details */}
                      <div className="space-y-1 text-sm">
                        <div><span className="font-bold">𝗖𝗮𝗿𝗱-</span> {result.card}</div>
                        <div><span className="font-bold">𝐆𝐚𝐭𝐞𝐰𝐚𝐲-</span> Shopify 4$ [ /sh ]</div>
                        <div><span className="font-bold">𝐑𝐞𝐬𝐩𝐨𝐧𝐬𝐞-</span> {result.response}</div>
                        
                        {result.cardInfo && (
                          <>
                            <div><span className="font-bold">𝗜𝗻𝗳𝗼-</span> {result.cardInfo.type}</div>
                            <div><span className="font-bold">𝐁𝐚𝐧𝐤-</span> {result.cardInfo.bank}</div>
                            <div><span className="font-bold">𝐂𝐨𝐮𝐧𝐭𝐫𝐲-</span> {result.cardInfo.country} - {result.cardInfo.flag}</div>
                          </>
                        )}
                        
                        {result.processingTime && (
                          <div><span className="font-bold">𝗧𝗶𝗺𝗲-</span> {result.processingTime}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
      `}</style>
    </div>
  );
}

export default App;