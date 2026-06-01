<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;


/**
 * Description of MockController
 *
 * @author qu0262ch
 */
#[Route('/codex')]
class MockController extends AbstractController {
    protected \App\Service\SQL $sql;
    protected \Psr\Log\LoggerInterface $logger;
    public function __construct(\App\Service\SQL $sql, \Psr\Log\LoggerInterface $logger) {
        $this->sql = $sql;
        $this->logger = $logger;
    }
    
    #[Route('/years')]
    public function years(): JsonResponse {
        return $this->json($this->sql->fq('select `id`, `name` from `sessions` order by `name`'));
    }
    
    #[Route('/sections')]
    public function sections(int $y = 0): JsonResponse {
        $returns = $this->sql->kq('select `id`, `name` from `departments` order by `name`', 'id');
        foreach($returns as $k => $r) { $r[$k]['trainings'] = []; }
        $ts = $this->sql->fq('select `id`, `name`, `department_id` from `trainings` order by `name`');
        foreach($ts as $t) {
            $tid = $t['department_id'];
            if(array_key_exists($tid, $returns)) {
                $returns[$tid]['trainings'][] = $t;
            }
        }
        return $this->json(array_values($returns));
    }
    
    #[Route('/semesters/{section}')]
    public function semesters(?int $section = null): JsonResponse {
        $q = 'select y.`id`, y.`name` from `years` y';
        $qa = [];
        if(!empty($section)) {
            $q .= ' right join `semesters` s on s.`year_id`=y.`id`';
            $q .= ' left join `teaching_units` t on t.`semester_id`=s.`id`';
            $q .= ' where t.`training_id`=:s';
            $qa['s'] = $section;
        }
        $q .= ' order by y.`name`';
        $this->logger->debug($q);
        $returns = $this->sql->kq($q, 'id', $qa);
        foreach($returns as $k => $r) { $r[$k]['semesters'] = []; }
        $ys = $this->sql->fq('select `id`, `name`, `year_id` from `semesters` order by length(`name`), `name`');
        foreach($ys as $y) {
            $yid = $y['year_id'];
            if(array_key_exists($yid, $returns)) {
                $returns[$yid]['semesters'][] = $y;
            }
        }
        return $this->json(array_values($returns));
    }
}
