import { defineConfig } from '@kubb/core'
import { pluginOas } from '@kubb/plugin-oas'
import { pluginReactQuery } from '@kubb/plugin-react-query'
import { pluginTs } from '@kubb/plugin-ts'
import { pluginZod } from '@kubb/plugin-zod'

export default defineConfig({
  root: '.',
  input: {
    path: 'http://localhost:5000/openapi.json',
  },
  output: {
    path: './src/api/generated',
    clean: true,
    barrelType: 'named',
  },
  plugins: [
    // Parse OpenAPI spec
    pluginOas({
      validate: false,
      generators: [],
    }),

    // Generate TypeScript types
    pluginTs({
      output: {
        path: 'types',
        banner: '// @ts-nocheck\n',
      },
      enumType: 'asConst',
      syntaxType: 'type',
      oasType: 'infer',
    }),

    // Generate Zod schemas for validation
    pluginZod({
      output: {
        path: 'schemas',
        banner: '// @ts-nocheck\n',
      },
    }),

    // Generate React Query hooks with custom client
    pluginReactQuery({
      output: {
        path: 'hooks',
        banner: '// @ts-nocheck\n',
      },
      client: {
        importPath: '@/api/client',
      },
      query: {
        methods: ['get'],
        importPath: '@tanstack/react-query',
      },
      mutation: {
        methods: ['post', 'put', 'patch', 'delete'],
        importPath: '@tanstack/react-query',
      },
      suspense: {},
      dataReturnType: 'data',
      pathParamsType: 'object',
    }),
  ],
})
