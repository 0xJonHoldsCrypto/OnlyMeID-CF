import { Frog } from 'frog'
import { devtools } from 'frog/dev'
import { serveStatic } from 'frog/serve-static'
import { introScreen } from './intro.js'
import { startScreen } from './start.js'
import { finishScreen } from './finish.js'
// import { errorScreen } from './components/error.js'
import { abi } from './lib/abi.js'
import { AIRSTACK_API_KEY } from './airstack/key.js'
import {
  State,
  contractAddress,
} from './lib/types.js'


export const app = new Frog({
  basePath: '/',
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": AIRSTACK_API_KEY,
      }
    }
  },
  assetsPath: '/',
  headers: {
    'cache-control': 'max-age=12',
  },
  imageOptions: {
    fonts: [
      {
        name: 'Libre Baskerville',
        source: 'google'
      }
    ]
  },
  initialState: {
    walletAddress: ''
  }
})

app.frame('/', introScreen)
app.frame('/start', startScreen)
app.frame('/finish', finishScreen)

app.transaction('/register', (c) => {
  const { previousState } = c
  const { walletAddress } = previousState as unknown as State

  return c.contract({
    abi,
    chainId: 'eip155:8453',
    functionName: 'register',
    args: [walletAddress],
    to: contractAddress
  })
})

app.transaction('/claim', (c) => {
  const { previousState } = c
  const { walletAddress } = previousState as unknown as State

  return c.contract({
    abi,
    chainId: 'eip155:8453',
    functionName: 'claim',
    args: [walletAddress],
    to: contractAddress
  })
})

const isCloudflareWorker = typeof caches !== 'undefined'
if (isCloudflareWorker) {
  // @ts-ignore
  const manifest = await import('__STATIC_CONTENT_MANIFEST')
  //
  const serveStaticOptions = { manifest, root: './' }
  app.use('/*', serveStatic(serveStaticOptions))
  devtools(app, { assetsPath: '/frog', serveStatic, serveStaticOptions })
} else {
  devtools(app, { serveStatic })
}

export default app
