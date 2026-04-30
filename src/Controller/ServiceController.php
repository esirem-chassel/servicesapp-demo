<?php
namespace App\Controller;

use Symfony\Component\Routing\Attribute\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

#[Route('/service')]
class ServiceController extends AbstractController {
    #[Route('/')]
    public function index(): Response {
        return $this->render('service/index.html.twig');
    }
}

