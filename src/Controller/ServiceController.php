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
    protected \Psr\Log\LoggerInterface $logger;
    public function __construct(SQL $sql, \Psr\Log\LoggerInterface $logger) {
        $this->sql = $sql;
        $this->logger = $logger;
    }
    
    #[Route('/')]
    public function index(): Response {
        return $this->render('service/index.html.twig');
    }
    
    #[Route('/overview/{training}/{session}/{semester}')]
    public function overview(int $training, int $session, int $semester): Response {
        $qa = [
            't' => $training,
            's' => $semester,
            'i' => $session,
        ];
        $allModes = $this->sql->fq("select `id`, `name`, `eqtd` from `speakmodes`");
        $trainingDetails = $this->sql->oq('select t.*, '
                . ' d.`name` as departName, s.`name` as semesterName '
                . ' from `session_teaching_units` stu '
                . ' left join `teaching_units` tu on tu.`id`=stu.`teaching_unit_id` '
                . ' left join `trainings` t on t.`id`=tu.`training_id` '
                . ' left join `departments` d on d.`id`=t.`department_id` '
                . ' left join `semesters` s on s.`id`=tu.`semester_id` '
                . ' left join `years` y on y.`id`=s.`year_id` '
                . ' where t.`id`=:t and s.`id`=:s and stu.`session_id`=:i ', $qa);
        $modules = $this->sql->kq('select t.*, u.`id` as unitId, u.`name` as unitName '
                . ' from `teaching_modules` t '
                . ' left join `teaching_units` u on u.`id`=t.`teaching_unit_id` '
                . ' left join `session_teaching_units` stu on stu.`teaching_unit_id`=u.`id` '
                . ' where u.`training_id`=:t and u.`semester_id`=:s and stu.`session_id`=:i', 'id', $qa);
        $modulesPerUnit = [];
        foreach($modules as $m) {
            if(!array_key_exists($m['unitId'], $modulesPerUnit)) {
                $modulesPerUnit[$m['unitId']] = [
                    'name' => $m['unitName'],
                    'modules' => [],
                ];
            }
            $modulesPerUnit[$m['unitId']]['modules'][$m['id']] = $m;
        }
        $reparts = $this->sql->fq('select v.*
from `v_reparts_fillings` v
left join `teaching_modules` t on t.`id`=v.`teaching_module_id`
left join `teaching_units` u on u.`id`=t.`teaching_unit_id`
where u.`training_id`=:t and u.`semester_id`=:s and v.`session_id`=:i', $qa);
        return $this->render('service/overview.html.twig', [
            'details' => $trainingDetails,
            'trainingId' => $training,
            'sessionId' => $session,
            'semesterId' => $semester,
            'reparts' => $reparts,
            'modules' => $modules,
            'modulesPerUnit' => $modulesPerUnit,
            'modes' => $allModes,
        ]);
    }
    
    #[Route('/search/{session}/{training}/{semester}')]
    public function search(int $session = 0, int $training = 0, int $semester = 0): JsonResponse {
        $returns = [];
        $q = 'select '
                . ' t.`id` as trainingId, '
                . ' t.`name` as trainingName, '
                . ' s.`id` as semesterId, '
                . ' s.`name` as semesterName, '
                . ' sm.`id` as sessionId, '
                . ' sm.`name` as sessionName, '
                . ' count(k.`speaker_id`) as nbSpeakers, '
                . ' vrf.`nbHours`, '
                . ' count(m.`id`) as mxModules, '
                . ' vrf.`mxHours`, '
                . ' sum(if(vrf.`nbHours`=vrf.`mxHours`, 1, 0)) as nbModules '
                . ' from `session_teaching_modules` stm '
                . ' left join `sessions` sm on sm.`id`=stm.`session_id` '
                . ' left join `teaching_modules` m on m.`id`=stm.`teaching_module_id` '
                . ' left join `teaching_units` u on u.`id`=m.`teaching_unit_id` '
                . ' left join `trainings` t on t.`id`=u.`training_id` '
                . ' left join `semesters` s on s.`id`=u.`semester_id` '
                . ' left join `years` y on y.`id`=s.`year_id` '
                . ' left join `training_year_coordinations` coo on coo.`year_id`=y.`id` and coo.`training_id`=t.`id` '
                . ' left join `speaks` k on k.`session_id`=sm.`id` and k.`teaching_module_id`=m.`id` '
                . ' left join `reparts` r on r.`session_id`=sm.`id` and r.`teaching_module_id`=m.`id` '
                . ' left join `v_reparts_fillings` vrf on vrf.`session_id`=sm.`id` and vrf.`teaching_module_id`=m.`id` ';
        $qw = [];
        $qa = [];
        if(!empty($session)) {
            $qw[] = 'stm.`session_id`=:y';
            $qa['y'] = $session;
        }
        if(!empty($semester)) {
            $qw[] = 's.`id`=:s';
            $qa['s'] = $semester;
        }
        if(!empty($training)) {
            $qw[] = 't.`id`=:t';
            $qa['t'] = $training;
        }
        if(empty($qw)) { // @TODO no filters : search for all coordinated modules
            
        }
        if(!empty($qw)) { // @TODO should never happen
            $q .= ' where '.implode(' and ', $qw);
        }
        $q .= ' group by t.`id`, sm.`id`, s.`id`';
        $this->logger->debug($q);
        $returns = $this->sql->fq($q, $qa);
        return $this->json($returns);
    }
    
    #[Route('/reparts/{training}/{session}/{semester}')]
    public function getReparts(int $training, int $session, int $semester): JsonResponse {
        $returns = [];
        // @TODO : add, for sharing, the information of who's "carrying" it
        $q = 'select coalesce(r.`mode_id`, dr.`mode_id`) as `mode_id`,'
                . ' coalesce(r.`nb`, dr.`nb`) as `nb` , '
                . ' coalesce(r.`timeby`, dr.`timeby`) as timeby`, '
                . ' coalesce(r.`groups`, dr.`groups`) as `groups`, '
                . ' coalesce(r.`teaching_module_id`, dr.`teaching_module_id`) as `teaching_module_id`, '
                . ' r.`session_id` '
                . ' from `default_reparts` dr '
                . ' left join `teaching_modules` m on m.`id`=dr.`teaching_module_id` '
                . ' left join `teaching_units` u on u.`id`=m.`teaching_unit_id` '
                . ' left join `reparts` r on r.`teaching_module_id`=dr.`teaching_module_id` and r.`mode_id`=dr.`mode_id` and r.`session_id`=:si '
                . ' where u.`training_id`=:tr and u.`semester_id`=:sm';
        $returns = $this->sql->fq($q, [
            'tr' => $training,
            'si' => $session,
            'sm' => $semester,
        ]);
        return $this->json($returns);
    }
}

