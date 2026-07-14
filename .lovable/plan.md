## Espace Client — Portail de validation

Un espace privé où chaque client suit son projet, télécharge les livrables, commente et valide chaque étape. Vous, en tant qu'admin, créez les comptes clients, uploadez les livrables et êtes notifié par email à chaque validation.

### Fonctionnement

**Côté admin (vous, `grcdtech@gmail.com`)**
- Interface `/admin` : liste de tous les projets clients
- Créer un nouveau projet → renseigner nom du projet + email client → un compte est créé et un email d'invitation est envoyé au client avec ses identifiants
- Sur chaque projet : uploader des fichiers par étape (vidéos, images, PDFs), voir les commentaires, voir l'état de chaque étape
- Notification email à chaque validation d'étape par le client

**Côté client**
- Reçoit un email d'invitation avec lien + mot de passe temporaire
- Se connecte sur `/espace-client`
- Voit son projet avec les 4 étapes en pipeline :
  1. Brief & cadrage
  2. Proposition créative
  3. Production
  4. Livraison finale
- Pour chaque étape : télécharge les fichiers déposés, laisse un commentaire, clique "Valider cette étape"
- Historique visible : dates de validation, statuts (en attente / en cours / validé)

### Étapes techniques

```text
1. Base de données (migration Lovable Cloud)
   - profiles (id → auth.users, full_name, role: 'admin' | 'client')
   - user_roles (séparation sécurité, avec fonction has_role)
   - projects (id, client_id, name, created_at)
   - project_stages (id, project_id, stage_key, status, validated_at, client_comment)
     → 4 lignes créées auto à la création d'un projet
   - stage_files (id, stage_id, file_name, file_path, uploaded_at)
   - stage_comments (id, stage_id, author_id, content, created_at)
   - Storage bucket 'project-files' (privé, RLS par projet)
   - RLS : admin voit tout ; client voit uniquement ses projets

2. Auth
   - Activation Email/Password (auto-confirm ON pour simplifier l'invitation)
   - Compte admin seed : grcdtech@gmail.com (mot de passe fourni au 1er login)
   - Route /login publique
   - Layout _authenticated protégé (déjà en place)

3. Routes
   - /login — connexion
   - /espace-client — dashboard client (liste projets + étapes)
   - /admin — dashboard admin (liste tous projets, création)
   - /admin/projets/$id — gestion d'un projet (upload fichiers, voir validations)

4. Server functions
   - createClientProject (admin) : crée user client + projet + 4 étapes + envoie email invitation
   - uploadStageFile (admin) : upload dans storage + insert stage_files
   - validateStage (client) : passe status='validated' + envoie email à l'admin
   - addStageComment : ajoute un commentaire

5. Emails (via l'infra email existante)
   - Invitation client (identifiants de connexion)
   - Notification admin à chaque validation d'étape
   - Notification client quand admin dépose de nouveaux fichiers

6. UI
   - Design cohérent avec le site (Bodoni Moda + Jura, noir/blanc, minimal)
   - Pipeline visuel des 4 étapes avec états
   - Lien discret "Espace client" dans le footer
```

### Ce qui n'est PAS inclus (à demander plus tard si besoin)
- Signature électronique de devis
- Facturation / paiements
- Chat temps réel
- Multi-projets simultanés par client (1 client = 1 projet actif pour commencer, extensible)

Confirmez et je lance l'implémentation.