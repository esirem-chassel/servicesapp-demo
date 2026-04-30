<?php

namespace App\Controller;

/**
 * Description of MockController
 *
 * @author qu0262ch
 */
#[Route('/codex')]
class MockController extends \Symfony\Bundle\FrameworkBundle\Controller\AbstractController {
    #[Route('/years')]
    public function years(): \Symfony\Component\HttpFoundation\Response {
        
    }
    
    #[Route('/years/{y}/sections')]
    public function sections(int $y = 0): \Symfony\Component\HttpFoundation\Response {
        
    }
    
    #[Route('/years/{y}/sections/{s}')]
    public function semesters(int $y = 0, int $s = 0): \Symfony\Component\HttpFoundation\Response {
        
    }
}
