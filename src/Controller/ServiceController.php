<?php
namespace App\Controller;

use App\Service\SQL;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/')]
class ServiceController extends AbstractController {
    protected SQL $sql;
    public function __construct(SQL $sql) {
        $this->sql = $sql;
    }
    
    #[Route('/')]
    public function index(): Response {
        return $this->render('service/index.html.twig');
    }
    
    #[Route('/overview/{module}')]
    public function overview(int $module): Response {
        return $this->render('service/overview.html.twig');
    }
    
    #[Route('/reparts/{module}')]
    public function editModel(int $module): Response {
        return $this->render('service/reparts.html.twig');
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
    
    #[Route('/search/{year}/{section}/{semester}')]
    public function search(int $year = 0, int $section = 0, int $semester = 0): JsonResponse {
        $returns = [
            
        ];
        return $this->json($returns);
    }
}

