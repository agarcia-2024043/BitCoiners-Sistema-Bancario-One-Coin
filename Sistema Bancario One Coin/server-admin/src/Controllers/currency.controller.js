// =====================================================
// API de divisas: Frankfurter (https://www.frankfurter.app)
// API pública, gratuita, sin necesidad de API key, mantenida con datos
// del Banco Central Europeo. Cumple con el requisito del PDF de
// "investigar e integrar un API de conversión de divisas".
// =====================================================
const FRANKFURTER_BASE_URL = "https://api.frankfurter.app";

// Tasas de respaldo (solo se usan si la API externa no responde)
const FALLBACK_RATES = {
    USD: 1,
    GTQ: 7.75,
    EUR: 0.92,
    MXN: 17.15,
};

// Frankfurter no incluye HNL ni CRC, así que limitamos a las monedas que sí soporta
const SUPPORTED_CURRENCIES = ["USD", "GTQ", "EUR", "MXN", "GBP", "JPY", "CAD"];

// =====================================================
// GET /currencies — lista de monedas y tasas vs USD (en tiempo real)
// =====================================================
export const getRates = async (req, res) => {
    try {
        const response = await fetch(`${FRANKFURTER_BASE_URL}/latest?from=USD`);

        if (!response.ok) throw new Error("La API de divisas no respondió correctamente");

        const data = await response.json();

        res.json({
            success: true,
            base: "USD",
            // Inyectamos GTQ y usamos los rates de Frankfurter
            rates: { USD: 1, GTQ: FALLBACK_RATES.GTQ, ...data.rates },
            source: "frankfurter.app",
            updatedAt: data.date
        });
    } catch (error) {
        // Si la API externa falla, se responde con tasas de respaldo para no romper el flujo
        res.json({
            success: true,
            base: "USD",
            rates: FALLBACK_RATES,
            source: "fallback (la API externa no respondió)",
            updatedAt: new Date().toISOString()
        });
    }
};

// =====================================================
// POST /currencies/convert
// Body: { amount, from, to }
// =====================================================
export const convertCurrency = async (req, res) => {
    const { amount, from, to } = req.body;

    if (!amount || !from || !to) {
        return res.status(400).json({ message: "amount, from y to son obligatorios" });
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "El monto debe ser mayor a 0" });
    }

    const fromCurrency = from.toUpperCase();
    const toCurrency   = to.toUpperCase();

    if (fromCurrency === toCurrency) {
        return res.json({
            success: true,
            original: { amount: parsedAmount, currency: fromCurrency },
            converted: { amount: parsedAmount, currency: toCurrency },
            rate: 1,
            source: "frankfurter.app"
        });
    }

    try {
        // Si una de las monedas es GTQ, usamos cálculo manual con FALLBACK_RATES
        if (fromCurrency === 'GTQ' || toCurrency === 'GTQ') {
            throw new Error('GTQ requires manual calculation');
        }

        const response = await fetch(
            `${FRANKFURTER_BASE_URL}/latest?amount=${parsedAmount}&from=${fromCurrency}&to=${toCurrency}`
        );

        if (!response.ok) {
            throw new Error('Unsupported currency by Frankfurter');
        }

        const data = await response.json();
        const convertedAmount = data.rates[toCurrency];

        if (convertedAmount == null) {
            throw new Error(`Moneda destino no soportada: ${toCurrency}`);
        }

        return res.json({
            success: true,
            original: { amount: parsedAmount, currency: fromCurrency },
            converted: {
                amount: Math.round(convertedAmount * 100) / 100,
                currency: toCurrency
            },
            rate: convertedAmount / parsedAmount,
            source: "frankfurter.app",
            date: data.date
        });

    } catch (error) {
        // Fallback con tasas fijas para GTQ u otras monedas si la API externa falla o no las soporta
        if (!FALLBACK_RATES[fromCurrency] || !FALLBACK_RATES[toCurrency]) {
            return res.status(400).json({
                message: `No se puede calcular la conversión entre ${fromCurrency} y ${toCurrency}`
            });
        }

        const amountInUSD = parsedAmount / FALLBACK_RATES[fromCurrency];
        const convertedAmount = amountInUSD * FALLBACK_RATES[toCurrency];

        return res.json({
            success: true,
            original: { amount: parsedAmount, currency: fromCurrency },
            converted: {
                amount: Math.round(convertedAmount * 100) / 100,
                currency: toCurrency
            },
            rate: FALLBACK_RATES[toCurrency] / FALLBACK_RATES[fromCurrency],
            source: "fallback / manual"
        });
    }
};