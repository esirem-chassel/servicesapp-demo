<?php
namespace App\Service;

/**
 * Description of SQL
 *
 * @author qu0262ch
 */
class SQL {
    /**
     * Internal PDO connection
     * @var \PDO
     */
    protected \PDO $connection;
    public function __construct(string $dsn) {
        try {
            $this->connect($dsn);
        } catch(\Exception $e) {
            // erase DSN from trace
            throw new \App\Exception\SQLInvalidConfigException('Invalid config, check SQL_DSN', 0, $e);
        }
    }
    
    /**
     * Connect PDO to the DB
     * @param string $dsn
     */
    protected function connect(string $dsn): SQL {
        $this->connection = new \PDO($dsn, null, null, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
        ]);
        return $this;
    }
    
    /**
     * Get current PDO connection
     * @return \PDO
     */
    protected function getConnection(): \PDO {
        return $this->connection;
    }
    
    /**
     * Execute a query, returning the pure statement
     * @param string $query
     * @param array $a
     * @return \PDOStatement
     */
    public function q(string $query, array $a = []): \PDOStatement {
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute($a);
        return $stmt;
    }
    
    /**
     * Execute the query, returns the scalar value of the first line in the entry $k
     * @param string $query
     * @param string $k
     * @param array $a
     * @return scalar or null if not found
     */
    public function oq(string $query, string $k, array $a = []) {
        
    }
}
