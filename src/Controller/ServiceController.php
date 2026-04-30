<?php
namespace App\Controller;

use App\Service\SQL;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/service')]
class ServiceController extends AbstractController {
    protected SQL $sql;
    public function __construct(SQL $sql) {
        $this->sql = $sql;
    }
    
    #[Route('/')]
    public function index(): Response {
        return $this->render('service/index.html.twig');
    }
    
    #[Route('/prom/{prom}')]
    public function prom(int $prom): Response {
        $pdatas = [
            'rowid' => 1,
            'name' => 'Systèmes d\'exploitation',
            'nb' => [
                'mods' => 8,
                'hours' => (8*30) - 10,
                'speakers' => 6,
                'totmods' => 8,
                'tothours' => 8*30,
            ],
        ];
        return $this->render('service/prom.html.twig', $pdatas);
    }
    
    #[Route('/speaker/{speaker}')]
    public function speaker(int $speaker): Response {
        return $this->render('service/speaker.html.twig');
    }
    
    protected static function mockProms() {
        return [
            // y1
            1 => [
                // Cyber
                1 => [
                    // s5
                    5 => [
                        
                    ],
                ],
            ],
        ];
    }
    
    #[Route('/search/{year}/{section}/{semester}')]
    public function search(int $year = 0, int $section = 0, int $semester = 0): JsonResponse {
        $returns = [
            
        ];
        return $this->json($returns);
    }
}

