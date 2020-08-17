import { ProviderBase, Init } from "@netjam/server";
import { DataFetcherProvider } from "./data-fetcher.provider";

export class CommandsProvider extends ProviderBase {

    async forceUpdateServices() {
        const provider = this.getProvider<DataFetcherProvider>(DataFetcherProvider.name);
        await provider.gatherData();
    }

     
}