@extends('flarum.forum::email.plain.information.base')

@section('informationContent')
<% if (!content) { %>   <!-- Required content -->
<% } else { %>  <%- content %><% } %>
@endsection

{{--@section('contentPreview')--}}
{{--    <!-- Optional content -->--}}
{{--@endsection--}}
