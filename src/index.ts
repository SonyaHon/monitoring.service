import {HealthProvider, NetjamServer} from '@netjam/server';
import {WebviewApiProvider}           from './webview.api.provider';
import {DataFetcherProvider}          from './data-fetcher.provider';
import { CommandsProvider } from './commands.provider';

const njApp = new NetjamServer({
    server      : {
        host: '0.0.0.0',
        port: 9999,
    },
    microservice: {
        serviceName    : 'monitoring',
        redisConnection: {
            host: 'localhost',
            port: 6379,
        },
    },
});

(async () => {
    try {
        njApp.useGlobalRestApiPrefix('/api');
        await njApp.bootstrap([
            new HealthProvider(),
            new DataFetcherProvider(),
            new WebviewApiProvider(),
            new CommandsProvider(),
        ]);
        await njApp.start();
        console.log('Service started on 0.0.0.0:9999');
    } catch (e) {
        console.error(e);
    }
})();