import snowflake from 'snowflake-sdk'

snowflake.configure({ logLevel: 'ERROR' })

export async function runQuery<T = Record<string, unknown>>(sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const conn = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT!,
      username: process.env.SNOWFLAKE_USERNAME!,
      password: process.env.SNOWFLAKE_PASSWORD!,
      database: process.env.SNOWFLAKE_DATABASE || 'EDMA_PROD',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || 'EDMA_EAP_01_WH',
      schema: process.env.SNOWFLAKE_SCHEMA || 'EDMA_STRATOPS',
      role: process.env.SNOWFLAKE_ROLE || 'EDMA_PRODANALYST',
    })

    conn.connect((err, connection) => {
      if (err) return reject(new Error(`Snowflake connect failed: ${err.message}`))
      connection.execute({
        sqlText: sql,
        complete: (err, _stmt, rows) => {
          connection.destroy(() => {})
          if (err) return reject(new Error(`Query failed: ${err.message}`))
          resolve((rows ?? []) as T[])
        },
      })
    })
  })
}

export function isConfigured(): boolean {
  return !!(
    process.env.SNOWFLAKE_ACCOUNT &&
    process.env.SNOWFLAKE_USERNAME &&
    process.env.SNOWFLAKE_PASSWORD
  )
}
