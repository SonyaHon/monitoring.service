import {Get, Init, Provider, ProviderBase, ProviderType, Query} from '@netjam/server';
import {DataFetcherProvider}                                    from './data-fetcher.provider';

@Provider(ProviderType.REST)
export class WebviewApiProvider extends ProviderBase {
    private dataSource: DataFetcherProvider;

    @Init
    async init() {
        this.dataSource = this.getProvider<DataFetcherProvider>(DataFetcherProvider.name);
    }

    @Get('/services-data')
    getServiceData(@Query() query: { withMonitoring: boolean }) {
        return this.dataSource.getServiceData(query.withMonitoring);
    }

    @Get('/service')
    getServiceDataById(@Query() query: { id: string }) {
        return this.dataSource.getServiceDataById(query.id);
    }
}