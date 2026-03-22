"use client";

import { useState, useEffect } from "react";
import { Shuffle, RotateCcw, Users, Star, UserPlus, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerForm, type Player } from "@/components/player-form";
import { PlayerImport, type ImportResult } from "@/components/player-import";
import { PlayerList } from "@/components/player-list";
import { distributeBalancedTeams } from "@/lib/balance-teams";
import { orderPlayersForSlotAllocation } from "@/lib/draw-order";
import { normalizeSkill } from "@/lib/player-skill";
import { TeamConfig } from "@/components/team-config";
import { TeamCard } from "@/components/team-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SkillStars } from "@/components/skill-stars";

const STORAGE_KEY = "pinico-city-players";
/** Mesmo basePath do next.config (GitHub Pages em subpasta ou raiz) — exposto via env no build */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function TeamSorter() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [numTeams, setNumTeams] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(5);
  const [teams, setTeams] = useState<Player[][]>([]);
  const [benchPlayers, setBenchPlayers] = useState<Player[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [activeTab, setActiveTab] = useState("cadastro");
  const [isLoaded, setIsLoaded] = useState(false);
  const [importFeedback, setImportFeedback] = useState<string | null>(null);

  // Carregar jogadores do localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setPlayers(
            parsed.map((p) => ({
              ...p,
              skill: normalizeSkill(p.skill),
            })),
          );
        }
      } catch (e) {
        console.error("Erro ao carregar jogadores:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar jogadores no localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    }
  }, [players, isLoaded]);

  const handleAddPlayer = (player: Player) => {
    setPlayers((prev) => [...prev, { ...player, listPriority: undefined }]);
  };

  const handleImportMerge = (result: ImportResult) => {
    const { added, skippedDuplicates, skippedExisting } = result;
    setPlayers((prev) => [...prev, ...added]);
    const parts: string[] = [];
    if (added.length) parts.push(`${added.length} adicionado(s)`);
    if (skippedExisting) parts.push(`${skippedExisting} já cadastrado(s)`);
    if (skippedDuplicates) parts.push(`${skippedDuplicates} repetido(s) na colagem`);
    if (parts.length === 0) {
      setImportFeedback("Nenhum nome novo — cole uma lista ou confira duplicados.");
    } else {
      setImportFeedback(parts.join(" · "));
    }
  };

  const handleImportReplace = (newPlayers: Player[]) => {
    setPlayers(newPlayers);
    setSelectedIds(newPlayers.map((p) => p.id));
    setTeams([]);
    setBenchPlayers([]);
    setImportFeedback(
      newPlayers.length
        ? `Cadastro substituído: ${newPlayers.length} jogador(es) com ordem de lista ativa.`
        : "Cadastro limpo — nenhum nome na colagem.",
    );
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setSelectedIds((prev) => prev.filter((pid) => pid !== id));
    setTeams([]);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(players.map((p) => p.id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const balancedShuffle = () => {
    const selectedPlayers = players.filter((p) => selectedIds.includes(p.id));
    
    // Total de vagas disponíveis (times * jogadores por time)
    const totalSlots = numTeams * playersPerTeam;
    
    // Quem entra em campo vs banco: ordem da lista importada primeiro; sem prioridade, aleatório
    const orderedForSlots = orderPlayersForSlotAllocation(selectedPlayers);

    const playersToDistribute = orderedForSlots.slice(0, totalSlots);
    const bench = orderedForSlots.slice(totalSlots);

    const newTeams = distributeBalancedTeams(
      playersToDistribute,
      numTeams,
      playersPerTeam,
    );

    return { teams: newTeams, bench };
  };

  const runSorteio = async () => {
    setIsShuffling(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = balancedShuffle();
    setTeams(result.teams);
    setBenchPlayers(result.bench);
    setIsShuffling(false);
  };

  const handleShuffle = () => {
    void runSorteio();
  };

  /** Novo sorteio = sortear de novo (times diferentes, ainda equilibrados) */
  const handleNewDraw = () => {
    void runSorteio();
  };

  const handleClearAll = () => {
    setPlayers([]);
    setSelectedIds([]);
    setTeams([]);
    setBenchPlayers([]);
  };

  const totalSlots = numTeams * playersPerTeam;
  const canShuffle = selectedIds.length >= numTeams; // Mínimo 1 jogador por time
  
  // Calcula quantos jogadores vão jogar e quantos ficam de fora
  const playersInGame = Math.min(selectedIds.length, totalSlots);
  const playersOut = Math.max(0, selectedIds.length - totalSlots);
  const teamsComplete = selectedIds.length >= totalSlots;

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Centralizado */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center text-center">
            <img
              src={`${BASE_PATH}/logo-pinico-city.png`}
              alt="Pinico City FC"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-lg mb-3"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">
              Pinico City FC
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sorteio de Times Equilibrados
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="cadastro" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Cadastrar</span> Jogadores
            </TabsTrigger>
            <TabsTrigger value="sorteio" className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              <span className="hidden sm:inline">Sortear</span> Times
            </TabsTrigger>
          </TabsList>

          {/* Aba de Cadastro */}
          <TabsContent value="cadastro" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Cadastrar Jogadores
                  </CardTitle>
                  {players.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="text-destructive hover:text-destructive"
                    >
                      Limpar Todos
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total cadastrados: {players.length} jogadores
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <PlayerImport
                  existingPlayers={players}
                  defaultSkill={3}
                  onImportMerge={handleImportMerge}
                  onImportReplace={handleImportReplace}
                />
                {importFeedback && (
                  <p className="text-sm text-muted-foreground rounded-md border border-border bg-secondary/50 px-3 py-2">
                    {importFeedback}
                  </p>
                )}
                <PlayerForm onAddPlayer={handleAddPlayer} />
                <PlayerList
                  players={players}
                  selectedIds={[]}
                  onRemovePlayer={handleRemovePlayer}
                  onToggleSelect={() => {}}
                  onSelectAll={() => {}}
                  onDeselectAll={() => {}}
                  selectionMode={false}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Sorteio */}
          <TabsContent value="sorteio" className="space-y-6">
            {/* Configuracao */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Configuracao dos Times
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TeamConfig
                  numTeams={numTeams}
                  playersPerTeam={playersPerTeam}
                  onNumTeamsChange={setNumTeams}
                  onPlayersPerTeamChange={setPlayersPerTeam}
                />
                <div className="text-sm text-muted-foreground mt-3 space-y-1">
                  <p>
                    Vagas: <span className="font-medium text-foreground">{totalSlots}</span> ({numTeams} times x {playersPerTeam} jogadores)
                  </p>
                  <p>
                    Selecionados:{" "}
                    <span className="font-medium text-foreground">{selectedIds.length}</span> jogadores
                  </p>
                  {selectedIds.length > 0 && (
                    <>
                      {teamsComplete ? (
                        <p className="text-green-400">
                          {numTeams} times completos
                          {playersOut > 0 && (
                            <span className="text-amber-400"> ({playersOut} no banco)</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-amber-400">
                          Faltam {totalSlots - selectedIds.length} jogadores para completar os times
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Selecionar Jogadores */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ListChecks className="w-5 h-5" />
                  Selecionar Jogadores para o Sorteio
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Escolha quem vai participar. O sorteio equilibra a{" "}
                  <span className="text-foreground font-medium">soma das estrelas</span>{" "}
                  entre os times (quem tem mais estrelas é distribuído para não concentrar
                  força). Com lista do WhatsApp, quem está no topo entra antes se houver
                  banco; quem veio só do formulário entra depois, em ordem aleatória.
                </p>
              </CardHeader>
              <CardContent>
                {players.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum jogador cadastrado</p>
                    <Button
                      variant="link"
                      onClick={() => setActiveTab("cadastro")}
                      className="text-primary"
                    >
                      Ir para aba de cadastro
                    </Button>
                  </div>
                ) : (
                  <PlayerList
                    players={players}
                    selectedIds={selectedIds}
                    onRemovePlayer={handleRemovePlayer}
                    onToggleSelect={handleToggleSelect}
                    onSelectAll={handleSelectAll}
                    onDeselectAll={handleDeselectAll}
                    selectionMode={true}
                  />
                )}
              </CardContent>
            </Card>

            {/* Botoes de Acao */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleShuffle}
                disabled={!canShuffle || isShuffling}
                className="flex-1 h-12 text-lg"
                size="lg"
              >
                <Shuffle className={`w-5 h-5 mr-2 ${isShuffling ? "animate-spin" : ""}`} />
                {isShuffling ? "Sorteando..." : "Sortear Times"}
              </Button>
              {teams.length > 0 && (
                <Button
                  variant="outline"
                  onClick={handleNewDraw}
                  disabled={!canShuffle || isShuffling}
                  className="sm:w-auto h-12 bg-transparent"
                  size="lg"
                >
                  <RotateCcw
                    className={`w-5 h-5 mr-2 ${isShuffling ? "animate-spin" : ""}`}
                  />
                  {isShuffling ? "Reorganizando..." : "Novo Sorteio"}
                </Button>
              )}
            </div>

            {!canShuffle && selectedIds.length > 0 && (
              <p className="text-center text-amber-500 text-sm">
                Selecione pelo menos {numTeams} jogadores (1 por time) para sortear
              </p>
            )}

            {players.length > 0 && selectedIds.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                Selecione os jogadores que vao participar do sorteio
              </p>
            )}

            {/* Resultado */}
            {teams.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Star className="w-5 h-5 text-accent fill-accent" />
                  Resultado do Sorteio
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {teams.map((teamPlayers, index) => (
                    <TeamCard
                      key={index}
                      teamNumber={index + 1}
                      players={teamPlayers}
                      color=""
                    />
                  ))}
                </div>

                {/* Estatisticas */}
                <Card className="bg-secondary/50">
                  <CardContent className="py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      {teams.map((teamPlayers, index) => {
                        const totalSkill = teamPlayers.reduce((sum, p) => sum + p.skill, 0);
                        return (
                          <div key={index}>
                            <p className="text-sm text-muted-foreground">Time {index + 1}</p>
                            <p className="text-lg font-bold">{totalSkill} estrelas</p>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Jogadores no Banco */}
                {benchPlayers.length > 0 && (
                  <Card className="border-amber-500/50 bg-amber-500/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-amber-500">
                        <Users className="w-5 h-5" />
                        No Banco ({benchPlayers.length} jogador{benchPlayers.length > 1 ? 'es' : ''})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {benchPlayers.map((player) => (
                          <div
                            key={player.id}
                            className="flex items-center gap-2 bg-amber-500/20 px-3 py-2 rounded-lg"
                          >
                            <span className="font-medium">{player.name}</span>
                            <SkillStars
                              value={player.skill}
                              starClassName="text-amber-400 fill-amber-400"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-6 text-center text-sm text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <img
            src={`${BASE_PATH}/logo-pinico-city.png`}
            alt="Pinico City FC"
            className="w-10 h-10 object-contain opacity-70"
          />
          <p>Pinico City Futebol Clube - 03/11/23</p>
        </div>
      </footer>
    </div>
  );
}
