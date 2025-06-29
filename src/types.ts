interface Header {
    fileName: string;
}

interface PortfolioCard {
    title: string;
    video: boolean;
    photo: boolean;
    graphic: boolean;
    fileName: string;
}

interface Client {
    name: string;
    fileLogo: string;
    fileName: string;
}

interface Connect {
    fileName: string;
    offers: string[];
    priceRanges: string[];
}

interface Data {
    header: Header;
    portfolioCards: PortfolioCard[];
    clients: Client[];
    connect: Connect;
}

export { Data, PortfolioCard, Client, Connect }