const mysqlconfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'root',
  database: 'AG',
  connectionLimit: 10
}
const pool = require('mysql').createPool(mysqlconfig)
const mysqlexport = {
  query(query, params, callback) {
    if (process.env.LOG_MYSQL_LATENCY) console.time('mysql_latency')
    pool.getConnection((err, conn) => {
      if (err != null) {
        console.log(`[ERROR] Failed to getConnection from mySQL - ${err}`, true, true)
        if (conn != null) {
          conn.release()
        }
        if (callback != null) {
          if (process.env.LOG_MYSQL_LATENCY) console.timeEnd('mysql_latency')
          return callback('DB error')
        }
      }
      conn.query(query, params, (_err, rows) => {
        if (process.env.LOG_MYSQL_LATENCY) console.timeEnd('mysql_latency')
        if (_err != null) {
          console.log(`Error : ` + _err)
        }
        conn.release()
        if (callback != null) {
          return callback(_err, rows)
        }
      })
    })
  },
  end(callback) {
    pool.end(callback)
  }
}
module.exports = mysqlexport
