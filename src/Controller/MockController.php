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
    protected static function getYears() {
        return [
            ['rowid' => 1, 'name' => '2025/2026',],
            ['rowid' => 2, 'name' => '2026/2027',],
        ];
    }
    
    protected static function getSections() {
        return [
            ['rowid' => 1, 'name' => 'Cyber',],
            ['rowid' => 2, 'name' => 'IoT',],
            ['rowid' => 3, 'name' => 'CND',],
            ['rowid' => 4, 'name' => 'GEIPI',],
        ];
    }
    
    protected static function getSemesters() {
        return [
            ['rowid' => 1, 'name' => 'S1',],
            ['rowid' => 2, 'name' => 'S2',],
            ['rowid' => 3, 'name' => 'S3',],
            ['rowid' => 4, 'name' => 'S4',],
            ['rowid' => 5, 'name' => 'S5',],
            ['rowid' => 6, 'name' => 'S6',],
            ['rowid' => 7, 'name' => 'S7',],
            ['rowid' => 8, 'name' => 'S8',],
            ['rowid' => 9, 'name' => 'S9',],
            ['rowid' => 10, 'name' => 'S10',],
        ];
    }
    
    protected static function getSBY() {
        return [
            1 => [1, 2, 3, 4,],
            2 => [1, 2, 3, 4,],
        ];
    }
    
    protected static function getSBS() {
        return [
            1 => [5, 6, 7, 8, 9, 10,],
            2 => [5, 6, 7, 8, 9, 10,],
            3 => [5, 6, 7, 8, 9, 10,],
            4 => [1, 2, 3, 4,],
        ];
    }
    
    protected static function findSectionByYear($y) {
        $sby = static::getSBY();
        $returns = [];
        $selected = $sby[$y]??[];
        $sections = static::getSections();
        foreach($sections as $sect) {
            if(in_array($sect['rowid'], $selected)) {
                $returns[] = $sect;
            }
        }
        return $returns;
    }
    
    protected static function findSemestersBySection($s) {
        $sbs = static::getSBS();
        $returns = [];
        $selected = $sbs[$s]??[];
        $semesters = static::getSemesters();
        foreach($semesters as $sem) {
            if(in_array($sem['rowid'], $selected)) {
                $returns[] = $sem;
            }
        }
        return $returns;
    }
    
    #[Route('/years')]
    public function years(): JsonResponse {
        return $this->json(static::getYears());
    }
    
    #[Route('/years/{y}/sections')]
    public function sections(int $y = 0): JsonResponse {
        return $this->json(($y > 0)? static::findSectionByYear($y):static::getSections());
    }
    
    #[Route('/years/{y}/sections/{s}/semesters')]
    public function semesters(int $y = 0, int $s = 0): JsonResponse {
        $returns = [];
        if($y > 0) {
            if($s > 0) {
                $sby = static::getSBY();
                if(!empty($sby[$y]) && in_array($s, $sby[$y])) {
                    $returns = static::findSemestersBySection($s);
                }
            } else {
                $sections = static::findSectionByYear($y);
                $r = [];
                foreach($sections as $section) {
                    $sem = static::findSemestersBySection($section['rowid']);
                    foreach($sem as $sm) {
                        if(!in_array($sm['rowid'], $r)) {
                            $returns[] = $sm;
                            $r[] = $sm['rowid'];
                        }
                    }
                }
            }
        } elseif($s > 0) {
            $returns = static::findSemestersBySection($s);
        } else {
            $returns = static::getSemesters();
        }
        return $this->json($returns);
    }
}
