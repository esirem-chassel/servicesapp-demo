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
    public function __construct(string $dsn, ?string $usr, ?string $pwd) {
        try {
            $this->connect($dsn, $usr, $pwd);
        } catch(\Exception $e) {
            // erase DSN from trace
            throw new \App\Exception\SQLInvalidConfigException('Invalid config, check SQL_DSN', 0, $e);
        }
    }
    
    /**
     * Connect PDO to the DB
     * @param string $dsn
     */
    protected function connect(string $dsn, ?string $usr, ?string $pwd): SQL {
        $this->connection = new \PDO($dsn, $usr, $pwd, [
            \PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
            \PDO::MYSQL_ATTR_INIT_COMMAND => 'SET sql_mode=""',
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
     * Execute a query, returning an array using the $iter closure every iteration
     * @param string $query
     * @param callable $iter - first argument is the line itself, second is all processed lines
     * @param array $a
     * @return \PDOStatement
     */
    public function cq(string $query, callable $iter, array $a = []): array {
        $returns = [];
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute($a);
        while($l = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $returns[] = $iter($l, $returns);
        }
        return $returns;
    }
    
    /**
     * Execute a query, returning an array using the $iter closure every iteration, using $k as a key
     * @param string $query
     * @param callable $iter - first argument is the line itself, second is all processed lines
     * @param string $key
     * @param array $a
     * @return \PDOStatement
     */
    public function mq(string $query, callable $iter, string $key, array $a = []): array {
        $returns = [];
        $stmt = $this->getConnection()->prepare($query);
        $stmt->execute($a);
        while($l = $stmt->fetch(\PDO::FETCH_ASSOC)) {
            $l = $iter($l, $returns);
            if(array_key_exists($key, $l)) {
                $returns[$l[$key]] = $l;
            }
        }
        return $returns;
    }
    
    /**
     * Execute the query, returns everything in an array
     * @param string $query
     * @param array $a
     * @return array (empty if it fails)
     */
    public function fq(string $query, array $a = []) {
        $stmt = $this->q($query, $a);
        return empty($stmt)? []:$stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Execute the query, returns everything in an array, using th key $k as the new index
     * @param string $query
     * @param string $k
     * @param array $a
     * @return array
     */
    public function kq(string $query, string $k, array $a = []) {
        $returns = [];
        $stmt = $this->q($query, $a);
        if(!empty($stmt)) {
            while($r = $stmt->fetch(\PDO::FETCH_ASSOC)) {
                if(array_key_exists($k, $r)) {
                    $returns[$r[$k]] = $r;
                }
            }
        }
        return $returns;
    }
    
    /**
     * Execute the query, returns the first line
     * @param string $query
     * @param string $k
     * @param array $a
     * @return array or null if no line was found
     */
    public function oq(string $query, array $a = []) {
        $stmt = $this->q($query, $a);
        return empty($stmt)? []:$stmt->fetch(\PDO::FETCH_ASSOC);
    }
    
    /**
     * Execute the query, returns the scalar value of the first line in the entry $k
     * @param string $query
     * @param string $k
     * @param array $a
     * @return scalar or null if not found
     */
    public function sq(string $query, string $k, array $a = []) {
        $returns = null;
        $stmt = $this->q($query, $a);
        if(!empty($stmt)) {
            $r = $stmt->fetch(\PDO::FETCH_ASSOC);
            if(!empty($r) && array_key_exists($k, $r)) {
                $returns = $r[$k];
            }
        }
        return $returns;
    }
}
