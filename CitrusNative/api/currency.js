import { legalCurrencies, emojiCurrencies } from "./enum";

export class CurrencyManager {
    static getCurrencyName(currency, plural) {
        switch (currency) {
            case legalCurrencies.USD:
                return plural ? "dollars" : "dollar";
            case emojiCurrencies.BEER:
                return plural ? "beers" : "beer";
            case emojiCurrencies.PIZZA:
                return plural ? "pizzas" : "pizza";
            case emojiCurrencies.COFFEE:
                return plural ? "coffees" : "coffee";
            default:
                return "";
        }
    }
}